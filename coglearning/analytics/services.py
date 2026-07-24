from datetime import timedelta

from django.conf import settings
from django.db.models import Avg
from django.utils import timezone

from .models import UserPerformanceSummary, LearningAnalytics, UserAbandonmentSample
from assessment.models import Answer, TestSession

# No platform entry for this many days → ترک‌کرده + account deactivated
ABANDONMENT_INACTIVITY_DAYS = int(getattr(settings, 'ABANDONMENT_INACTIVITY_DAYS', 30))


class AnalyticsService:
    @staticmethod
    def log_event(user, event_type, data=None):
        """ثبت لاگ فعالیت کاربر"""
        LearningAnalytics.objects.create(
            user=user,
            event_type=event_type,
            event_data=data or {}
        )

    @staticmethod
    def get_last_entry_at(user):
        """
        Last time the user entered / used the platform.
        Prefer last_login, else last test session start, else date_joined.
        """
        candidates = []
        if user.last_login:
            candidates.append(user.last_login)

        last_session = (
            TestSession.objects.filter(user=user)
            .order_by('-started_at')
            .values_list('started_at', flat=True)
            .first()
        )
        if last_session:
            candidates.append(last_session)

        last_login_event = (
            LearningAnalytics.objects.filter(user=user, event_type='login')
            .order_by('-timestamp')
            .values_list('timestamp', flat=True)
            .first()
        )
        if last_login_event:
            candidates.append(last_login_event)

        if candidates:
            return max(candidates)
        return user.date_joined

    @staticmethod
    def days_since_last_entry(user):
        last_at = AnalyticsService.get_last_entry_at(user)
        if not last_at:
            return 0.0
        return max((timezone.now() - last_at).total_seconds() / 86400.0, 0.0)

    @staticmethod
    def evaluate_abandonment(user, summary=None, save=True):
        """
        Metric for ترک‌کرده (not ML risk):

          if days_since_last_entry >= 30:
              summary.abandoned = True
              user.is_active = False   # deactivate account
          else:
              summary.abandoned = False
              # do not auto-reactivate; admin must re-enable if needed
        """
        summary = summary or UserPerformanceSummary.objects.get_or_create(user=user)[0]
        inactive_days = AnalyticsService.days_since_last_entry(user)
        should_abandon = inactive_days >= ABANDONMENT_INACTIVITY_DAYS

        summary.abandoned = should_abandon
        if inactive_days > (summary.avg_login_interval_days or 0):
            summary.avg_login_interval_days = round(inactive_days, 2)

        if save:
            summary.save(update_fields=['abandoned', 'avg_login_interval_days', 'last_updated'])

        if should_abandon and user.is_active:
            user.is_active = False
            user.save(update_fields=['is_active'])

        return summary

    @staticmethod
    def record_login(user):
        """
        On successful login:
        - update avg_login_interval_days from previous last_login gap
        - clear abandoned flag (they returned; only if account was still allowed to log in)
        - set last_login + log event
        """
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)
        now = timezone.now()

        if user.last_login:
            gap_days = max((now - user.last_login).total_seconds() / 86400.0, 0.0)
            prev = summary.avg_login_interval_days or 0
            if prev <= 0:
                summary.avg_login_interval_days = round(gap_days, 2)
            else:
                summary.avg_login_interval_days = round((prev * 0.7) + (gap_days * 0.3), 2)

        summary.abandoned = False
        summary.save(update_fields=['avg_login_interval_days', 'abandoned', 'last_updated'])

        user.last_login = now
        user.save(update_fields=['last_login'])

        AnalyticsService.log_event(user, 'login', {'source': 'jwt'})
        return summary

    @staticmethod
    def update_user_performance_summary(user):
        """Recompute cognitive + CSV engagement fields, then apply ترک‌کرده rule."""
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)

        results = Answer.objects.filter(
            session__user=user,
            session__status='completed'
        ).values('question__category').annotate(avg_score=Avg('score_earned'))

        for res in results:
            cat = res['question__category']
            score = res['avg_score']
            if cat == 'memory':
                summary.avg_memory_score = score
            elif cat == 'focus':
                summary.avg_focus_score = score
            elif cat == 'logic':
                summary.avg_logic_score = score

        completed = TestSession.objects.filter(user=user, status='completed')
        summary.total_tests_completed = completed.count()

        # failed_tests_count — completed sessions below test.passing_score
        failed = 0
        for session in completed.select_related('test'):
            passing = getattr(session.test, 'passing_score', 70) or 70
            if (session.total_score or 0) < passing:
                failed += 1
        summary.failed_tests_count = failed

        # duration_of_use_minutes — sum of (finished_at - started_at) over completed tests
        total_minutes = 0.0
        for session in completed.exclude(finished_at=None):
            delta = session.finished_at - session.started_at
            total_minutes += max(delta.total_seconds() / 60.0, 0)
        if total_minutes > 0:
            summary.duration_of_use_minutes = round(total_minutes, 1)

        # progress_rate — cognitive_level / 100 (0–1)
        level = getattr(user, 'cognitive_level', None) or 1
        summary.progress_rate = round(min(max(level / 100.0, 0.0), 1.0), 3)

        summary.save()
        return AnalyticsService.evaluate_abandonment(user, summary=summary, save=True)

    @staticmethod
    def sync_abandonment_sample(user, summary=None):
        """Persist a CSV-aligned snapshot for the user (for tracking / ML)."""
        summary = summary or UserPerformanceSummary.objects.filter(user=user).first()
        if not summary:
            return None
        return UserAbandonmentSample.objects.create(
            user=user,
            avg_login_interval_days=summary.avg_login_interval_days,
            duration_of_use_minutes=summary.duration_of_use_minutes,
            failed_tests_count=summary.failed_tests_count,
            progress_rate=summary.progress_rate,
            abandoned=summary.abandoned,
            is_synthetic=False,
        )

    @staticmethod
    def get_peer_cohort(user, window_days=7, limit=12):
        """Peer students who registered around the same time as `user`."""
        from accounts.models import User

        joined = user.date_joined
        window = timedelta(days=window_days)
        peers = (
            User.objects.filter(
                role='student',
                is_active=True,
                date_joined__gte=joined - window,
                date_joined__lte=joined + window,
            )
            .exclude(id=user.id)
            .select_related('performance_summary')
            .order_by('date_joined')[:limit]
        )

        peer_rows = []
        levels = []
        for peer in peers:
            summary = getattr(peer, 'performance_summary', None)
            level = peer.cognitive_level or 1
            levels.append(level)
            peer_rows.append({
                'username': peer.username,
                'display_name': (
                    f"{peer.first_name} {peer.last_name}".strip() or peer.username
                ),
                'cognitive_level': level,
                'date_joined': peer.date_joined.isoformat(),
                'avg_memory_score': round(getattr(summary, 'avg_memory_score', 0) or 0, 1),
                'avg_focus_score': round(getattr(summary, 'avg_focus_score', 0) or 0, 1),
                'avg_logic_score': round(getattr(summary, 'avg_logic_score', 0) or 0, 1),
                'progress_rate': round(getattr(summary, 'progress_rate', 0) or 0, 3),
                'failed_tests_count': getattr(summary, 'failed_tests_count', 0) or 0,
                'is_current_user': False,
            })

        user_level = user.cognitive_level or 1
        cohort_avg = round(sum(levels) / len(levels), 1) if levels else float(user_level)
        higher_count = sum(1 for lv in levels if lv > user_level)

        return {
            'window_days': window_days,
            'peer_count': len(peer_rows),
            'cohort_avg_level': cohort_avg,
            'user_level': user_level,
            'peers_ahead': higher_count,
            'motivation_message': (
                f"{higher_count} نفر از هم‌دوره‌ای‌های شما سطح بالاتری دارند — با تمرین بیشتر می‌توانید از آن‌ها جلو بزنید."
                if higher_count
                else "شما در جمع هم‌دوره‌ای‌ها عملکرد خوبی دارید؛ همین روند را ادامه دهید."
            ),
            'peers': peer_rows,
        }

    @staticmethod
    def get_admin_dashboard_stats():
        """آمار کلی برای پنل مدیریت"""
        from accounts.models import User
        users = User.objects.filter(role='student')
        return {
            "total_citizens": users.count(),
            "avg_system_level": users.aggregate(Avg('cognitive_level'))['cognitive_level__avg'] or 0,
            "tests_taken": TestSession.objects.filter(status='completed').count(),
        }

"""استخراج ویژگی‌های رفتاری کاربر برای مدل پیش‌بینی ریزش."""

from django.db.models import Avg
from django.utils import timezone

# ترتیب ثابت بردار ویژگی برای sklearn
FEATURE_NAMES = [
    'days_since_last_login',
    'days_since_registration',
    'cognitive_level',
    'has_taken_placement_test',
    'test_session_count',
    'completed_session_count',
    'avg_test_score',
    'days_since_last_session',
    'content_progress_count',
    'completed_content_count',
    'recommendation_count',
    'level_change_count',
    'avg_memory_score',
    'avg_focus_score',
    'avg_logic_score',
    'login_inactivity',
]


def _days_between(earlier, later=None):
    """اختلاف روز بین دو datetime؛ None → 0."""
    if earlier is None:
        return 0.0
    later = later or timezone.now()
    if timezone.is_naive(earlier):
        earlier = timezone.make_aware(earlier, timezone.get_current_timezone())
    delta = later - earlier
    return max(delta.total_seconds() / 86400.0, 0.0)


def extract_user_features(user):
    """
    استخراج دیکشنری ویژگی‌های نام‌دار و بردار مرتب برای یک کاربر.
    داده‌های گم‌شده با صفر / مقادیر پیش‌فرض پر می‌شوند.
    """
    from assessment.models import TestSession
    from adaptive_learning.models import UserContentProgress, ContentRecommendation
    from analytics.models import LevelHistory, UserPerformanceSummary

    now = timezone.now()

    last_activity = user.last_login or user.date_joined
    days_since_last_login = _days_between(last_activity, now)
    days_since_registration = _days_between(user.date_joined, now)

    cognitive_level = getattr(user, 'cognitive_level', None) or 0
    has_taken_placement_test = 1 if getattr(user, 'has_taken_placement_test', False) else 0

    sessions = TestSession.objects.filter(user=user)
    test_session_count = sessions.count()
    completed = sessions.filter(status='completed')
    completed_session_count = completed.count()

    avg_score = completed.aggregate(avg=Avg('total_score'))['avg']
    avg_test_score = float(avg_score) if avg_score is not None else 0.0

    last_session = sessions.order_by('-started_at').first()
    if last_session is not None:
        ref = last_session.finished_at or last_session.started_at
        days_since_last_session = _days_between(ref, now)
    else:
        # بدون جلسه: پروکسی با روزهای ثبت‌نام
        days_since_last_session = days_since_registration

    progress_qs = UserContentProgress.objects.filter(user=user)
    content_progress_count = progress_qs.count()
    completed_content_count = progress_qs.filter(is_completed=True).count()

    recommendation_count = ContentRecommendation.objects.filter(user=user).count()
    level_change_count = LevelHistory.objects.filter(user=user).count()

    avg_memory_score = 0.0
    avg_focus_score = 0.0
    avg_logic_score = 0.0
    try:
        summary = UserPerformanceSummary.objects.filter(user=user).first()
        if summary is not None:
            avg_memory_score = float(summary.avg_memory_score or 0)
            avg_focus_score = float(summary.avg_focus_score or 0)
            avg_logic_score = float(summary.avg_logic_score or 0)
    except Exception:
        pass

    features = {
        'days_since_last_login': round(days_since_last_login, 4),
        'days_since_registration': round(days_since_registration, 4),
        'cognitive_level': float(cognitive_level),
        'has_taken_placement_test': float(has_taken_placement_test),
        'test_session_count': float(test_session_count),
        'completed_session_count': float(completed_session_count),
        'avg_test_score': round(avg_test_score, 4),
        'days_since_last_session': round(days_since_last_session, 4),
        'content_progress_count': float(content_progress_count),
        'completed_content_count': float(completed_content_count),
        'recommendation_count': float(recommendation_count),
        'level_change_count': float(level_change_count),
        'avg_memory_score': round(avg_memory_score, 4),
        'avg_focus_score': round(avg_focus_score, 4),
        'avg_logic_score': round(avg_logic_score, 4),
        'login_inactivity': round(days_since_last_login, 4),
    }

    vector = [features[name] for name in FEATURE_NAMES]
    return features, vector


def synthetic_churn_label(features):
    """
    برچسب مصنوعی برای bootstrap آموزش:
    churn اگر غیرفعال طولانی، بدون آزمون پس از ثبت‌نام، یا نمره ضعیف + فاصله از آخرین جلسه.
    """
    days_since_last_login = features.get('days_since_last_login', 0)
    test_session_count = features.get('test_session_count', 0)
    days_since_registration = features.get('days_since_registration', 0)
    completed_session_count = features.get('completed_session_count', 0)
    avg_test_score = features.get('avg_test_score', 0)
    days_since_last_session = features.get('days_since_last_session', 0)

    if days_since_last_login > 14:
        return 1
    if test_session_count == 0 and days_since_registration > 7:
        return 1
    if (
        completed_session_count > 0
        and avg_test_score < 40
        and days_since_last_session > 10
    ):
        return 1
    return 0


def heuristic_churn_probability(features):
    """احتمال تقریبی بدون مدل آموزش‌دیده (برای تست / fallback)."""
    label = synthetic_churn_label(features)
    if label == 1:
        # شدت نسبی بر اساس غیرفعالی
        inactivity = features.get('days_since_last_login', 0)
        score_penalty = max(0.0, (40 - features.get('avg_test_score', 40)) / 80.0)
        base = 0.55 + min(0.35, inactivity / 60.0) + min(0.1, score_penalty)
        return min(0.95, base)
    inactivity = features.get('days_since_last_login', 0)
    return min(0.45, 0.1 + inactivity / 40.0)

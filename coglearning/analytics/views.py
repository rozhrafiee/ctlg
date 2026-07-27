from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.db import models
from django.db.models import Q

# Models & Serializers
from .models import UserPerformanceSummary, LevelHistory
from .serializers import UserPerformanceSummarySerializer, LevelHistorySerializer
from .services import AnalyticsService
from accounts.permissions import IsAdminUser, IsTeacher
from assessment.models import TestSession, CognitiveTest
from assessment.serializers import TestSessionSerializer
from adaptive_learning.models import LearningContent, LearningPath, UserContentProgress, ContentRecommendation
from adaptive_learning.serializers import RecommendationSerializer

class UserMyStatsView(APIView):
    """آمار شخصی شهروند برای نمایش در پروفایل - بدون فیلدهای مدل ترک سیستم"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=request.user)
        return Response({
            'avg_memory_score': summary.avg_memory_score,
            'avg_focus_score': summary.avg_focus_score,
            'avg_logic_score': summary.avg_logic_score,
            'total_tests_completed': summary.total_tests_completed,
            'last_updated': summary.last_updated,
        })


class AdminEngagementMetricsView(APIView):
    """
    Admin-only: CSV engagement / abandonment-model fields for all citizens.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        from analytics.services import ABANDONMENT_INACTIVITY_DAYS

        summaries = (
            UserPerformanceSummary.objects
            .select_related('user')
            .filter(user__role='student')
            .order_by('-last_updated')
        )
        rows = []
        abandoned_count = 0
        for s in summaries:
            s = AnalyticsService.evaluate_abandonment(s.user, summary=s, save=True)
            inactive_days = round(AnalyticsService.days_since_last_entry(s.user), 1)
            if s.abandoned:
                abandoned_count += 1
            rows.append({
                'user_id': s.user_id,
                'username': s.user.username,
                'display_name': (
                    f"{s.user.first_name} {s.user.last_name}".strip() or s.user.username
                ),
                'cognitive_level': s.user.cognitive_level or 1,
                'date_joined': s.user.date_joined.isoformat(),
                'is_active': s.user.is_active,
                'days_inactive': inactive_days,
                'avg_login_interval_days': s.avg_login_interval_days,
                'duration_of_use_minutes': s.duration_of_use_minutes,
                'failed_tests_count': s.failed_tests_count,
                'progress_rate': s.progress_rate,
                'abandoned': s.abandoned,
                'avg_memory_score': s.avg_memory_score,
                'avg_focus_score': s.avg_focus_score,
                'avg_logic_score': s.avg_logic_score,
                'total_tests_completed': s.total_tests_completed,
                'last_updated': s.last_updated.isoformat() if s.last_updated else None,
            })

        return Response({
            'total_citizens': len(rows),
            'abandoned_count': abandoned_count,
            'active_count': len(rows) - abandoned_count,
            'abandonment_rule': {
                'metric': 'days_since_last_entry',
                'threshold_days': ABANDONMENT_INACTIVITY_DAYS,
                'description': (
                    f'اگر شهروند حداقل {ABANDONMENT_INACTIVITY_DAYS} روز وارد سامانه نشود، '
                    f'به‌عنوان ترک‌کرده علامت می‌خورد و حساب غیرفعال می‌شود.'
                ),
            },
            'csv_fields': [
                'avg_login_interval_days',
                'duration_of_use_minutes',
                'failed_tests_count',
                'progress_rate',
                'abandoned',
            ],
            'citizens': rows,
        })


class AdminGlobalStatsView(APIView):
    """گزارش کلان برای مدیریت سیستم"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        stats = AnalyticsService.get_admin_dashboard_stats()
        return Response(stats)

class TeacherStudentStatsView(APIView):
    """مشاهده روند پیشرفت یک شهروند خاص توسط مسئول شهری (مدرس) - با امنیت لایه دسترسی"""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request, student_id):
        # امنیت: بررسی اینکه آیا این شهروند در آزمون‌های این مسئول شهری (مدرس) شرکت کرده است؟
        # مسئول شهری (مدرس) فقط مجاز به دیدن تحلیل‌های شهروندان خودش است
        is_my_student = TestSession.objects.filter(
            user_id=student_id
        ).filter(
            Q(test__related_content__author=request.user) | Q(test__created_by=request.user)
        ).exists()

        is_admin = request.user.role == 'admin' or request.user.is_superuser or request.user.is_staff
        if not is_admin and not is_my_student:
            return Response(
                {"error": "شما اجازه دسترسی به تحلیل‌های این کاربر را ندارید."},
                status=status.HTTP_403_FORBIDDEN
            )

        summary = get_object_or_404(UserPerformanceSummary, user_id=student_id)
        serializer = UserPerformanceSummarySerializer(summary)
        return Response(serializer.data)

class TeacherDashboardView(APIView):
    """داشبورد متمرکز برای نقش مسئول شهری (مدرس)"""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request):
        user = request.user
        is_admin = user.role == 'admin' or user.is_superuser

        if is_admin:
            my_contents = LearningContent.objects.all()
            my_tests = CognitiveTest.objects.all()
            pending_reviews = TestSession.objects.filter(
                status='pending_review'
            ).select_related('user', 'test').order_by('-started_at')
        else:
            my_contents = LearningContent.objects.filter(author=user)
            my_tests = CognitiveTest.objects.filter(
                Q(related_content__author=user) | Q(created_by=user)
            ).distinct()
            pending_reviews = TestSession.objects.filter(
                test__in=my_tests,
                status='pending_review'
            ).select_related('user', 'test').order_by('-started_at')

        return Response({
            "teacher_name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "stats": {
                "total_contents": my_contents.count(),
                "total_tests": my_tests.count(),
                "pending_grading": pending_reviews.count(),
            },
            "recent_pending_reviews": TestSessionSerializer(pending_reviews[:5], many=True).data,
            "quick_links": {
                "create_content": "/api/adaptive-learning/teacher/content/create/",
                "create_test": "/api/assessment/teacher/tests/create/",
                "all_reviews": "/api/assessment/teacher/reviews/pending/"
            }
        })

class StudentDashboardView(APIView):
    """داشبورد جامع شهروند با تحلیل ۱-۱۰۰ و پروفایل شناختی - بهینه شده"""
    permission_classes = [permissions.IsAuthenticated]

    def get_rank(self, level):
        if level >= 90: return "الماس شناختی"
        if level >= 75: return "طلایی"
        if level >= 50: return "نقره‌ای"
        if level >= 25: return "برنزی"
        return "نوآموز"

    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        user = request.user

        def safe_response(identity, cognitive_profile=None, learning_status=None,
                         top_recommendations=None, recent_test_results=None, alerts=None,
                         chart_data=None, peer_cohort=None):
            return Response({
                "identity": identity,
                "cognitive_profile": cognitive_profile or {},
                "peer_cohort": peer_cohort or {},
                "learning_status": learning_status,
                "top_recommendations": top_recommendations or [],
                "recent_test_results": recent_test_results or [],
                "alerts": alerts or [],
                "chart_data": chart_data or {},
            })

        level = getattr(user, 'cognitive_level', None) or 1
        rank = self.get_rank(level)
        identity = {
            "full_name": f"{getattr(user, 'first_name', '') or ''} {getattr(user, 'last_name', '') or ''}".strip() or getattr(user, 'username', ''),
            "level": level,
            "rank": rank,
        }

        try:
            performance, _ = UserPerformanceSummary.objects.get_or_create(user=user)
            AnalyticsService.update_user_performance_summary(user)
            performance.refresh_from_db()
        except Exception as e:
            logger.exception("StudentDashboard: UserPerformanceSummary get_or_create failed: %s", e)
            return safe_response(identity, alerts=[{"type": "warning", "message": "بارگذاری داشبورد با خطا مواجه شد. لطفاً بعداً تلاش کنید."}])

        try:
            path_data = None
            active_path = LearningPath.objects.filter(user=user, is_active=True).first()
            if active_path:
                total_lessons = active_path.items.count()
                completed_lessons = UserContentProgress.objects.filter(
                    user=user,
                    content__learningpathitem_set__path=active_path,
                    is_completed=True
                ).distinct().count()
                path_data = {
                    "path_name": active_path.name,
                    "progress_percent": round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0,
                    "completed_count": completed_lessons,
                    "total_count": total_lessons
                }
        except Exception as e:
            logger.exception("StudentDashboard: learning path query failed: %s", e)
            path_data = None

        try:
            recent_tests = TestSession.objects.filter(user=user).exclude(status='in_progress').order_by('-finished_at')[:3]
            recent_test_results = TestSessionSerializer(recent_tests, many=True).data
        except Exception as e:
            logger.exception("StudentDashboard: recent tests failed: %s", e)
            recent_test_results = []

        try:
            recommendations = ContentRecommendation.objects.filter(user=user).order_by('-priority_weight')[:3]
            top_recommendations = RecommendationSerializer(recommendations, many=True).data
        except Exception as e:
            logger.exception("StudentDashboard: recommendations failed: %s", e)
            top_recommendations = []

        alerts = []
        if not getattr(user, 'has_taken_placement_test', True):
            alerts.append({"type": "warning", "message": "لطفاً برای شخصی‌سازی محتوا، آزمون تعیین سطح را انجام دهید."})
        try:
            for skill in ['memory', 'focus', 'logic']:
                score = getattr(performance, f'avg_{skill}_score', 0) or 0
                if score < 40 and (getattr(performance, 'total_tests_completed', 0) or 0) > 2:
                    alerts.append({"type": "critical", "message": f"نیاز به تمرین بیشتر در بخش {skill}"})
        except Exception:
            pass

        try:
            cognitive_profile = {
                'avg_memory_score': performance.avg_memory_score,
                'avg_focus_score': performance.avg_focus_score,
                'avg_logic_score': performance.avg_logic_score,
                'total_tests_completed': performance.total_tests_completed,
            }
        except Exception as e:
            logger.exception("StudentDashboard: cognitive_profile serialize failed: %s", e)
            cognitive_profile = {}

        try:
            peer_cohort = AnalyticsService.get_peer_cohort(user, window_days=14, limit=12)
        except Exception as e:
            logger.exception("StudentDashboard: peer_cohort failed: %s", e)
            peer_cohort = {}

        chart_data = {}
        try:
            content_completed_count = UserContentProgress.objects.filter(user=user, is_completed=True).count()
            tests_completed_count = TestSession.objects.filter(user=user, status='completed').count()
            level_history = LevelHistory.objects.filter(user=user).order_by('-timestamp')[:20]
            chart_data = {
                "content_completed_count": content_completed_count,
                "tests_completed_count": tests_completed_count,
                "level_history": LevelHistorySerializer(level_history, many=True).data,
            }
        except Exception as e:
            logger.exception("StudentDashboard: chart_data failed: %s", e)

        return safe_response(
            identity=identity,
            cognitive_profile=cognitive_profile,
            peer_cohort=peer_cohort,
            learning_status=path_data,
            top_recommendations=top_recommendations,
            recent_test_results=recent_test_results,
            alerts=alerts,
            chart_data=chart_data,
        )

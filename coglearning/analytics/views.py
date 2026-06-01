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
    """آمار شخصی شهروند برای نمایش در پروفایل - بهینه شده"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # دیگر نیازی به آپدیت دستی نیست، چون نمرات در لحظه پایان آزمون ذخیره شده‌اند
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=request.user)
        serializer = UserPerformanceSummarySerializer(summary)
        return Response(serializer.data)

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

        if not request.user.is_staff and not is_my_student:
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
        
        # ۱. فیلتر کردن محتواها و آزمون‌های مربوط به خود مسئول شهری (مدرس)
        my_contents = LearningContent.objects.filter(author=user)
        my_contents_count = my_contents.count()
        
        # آزمون‌هایی که یا متعلق به محتوای مسئول شهری (مدرس) هستند یا او سازنده آن‌هاست
        my_tests = CognitiveTest.objects.filter(
            Q(related_content__author=user) | Q(created_by=user)
        ).distinct()
        my_tests_count = my_tests.count()

        # ۳. تعداد آزمون‌های در انتظار تصحیح (فقط برای آزمون‌های این مسئول شهری/مدرس)
        pending_reviews = TestSession.objects.filter(
            test__in=my_tests,
            status='pending_review'
        ).order_by('-started_at')
        
        pending_reviews_count = pending_reviews.count()
        recent_pending_data = TestSessionSerializer(pending_reviews[:5], many=True).data

        return Response({
            "teacher_name": f"{user.first_name} {user.last_name}",
            "stats": {
                "total_contents": my_contents_count,
                "total_tests": my_tests_count,
                "pending_grading": pending_reviews_count,
            },
            "recent_pending_reviews": recent_pending_data,
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
                         top_recommendations=None, recent_test_results=None, alerts=None, chart_data=None):
            return Response({
                "identity": identity,
                "cognitive_profile": cognitive_profile or {},
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
            cognitive_profile = UserPerformanceSummarySerializer(performance).data
        except Exception as e:
            logger.exception("StudentDashboard: cognitive_profile serialize failed: %s", e)
            cognitive_profile = {}

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
            learning_status=path_data,
            top_recommendations=top_recommendations,
            recent_test_results=recent_test_results,
            alerts=alerts,
            chart_data=chart_data,
        )

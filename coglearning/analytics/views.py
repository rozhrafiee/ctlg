from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from .models import UserPerformanceSummary
from .serializers import UserPerformanceSummarySerializer
from .services import AnalyticsService
from accounts.permissions import IsAdminUser, IsTeacher
from assessment.models import TestSession, CognitiveTest
from adaptive_learning.models import LearningContent
from django.db.models import Count, Avg
from django.db import models
from assessment.models import TestSession
from assessment.serializers import TestSessionSerializer
from adaptive_learning.models import LearningPath, UserContentProgress, ContentRecommendation
from adaptive_learning.serializers import RecommendationSerializer

class UserMyStatsView(APIView):
    """آمار شخصی شهروند برای نمایش در پروفایل"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        AnalyticsService.update_user_performance_summary(request.user)
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
    """مشاهده روند پیشرفت یک شهروند خاص توسط استاد"""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request, student_id):
        summary = get_object_or_404(UserPerformanceSummary, user_id=student_id)
        serializer = UserPerformanceSummarySerializer(summary)
        return Response(serializer.data)

class TeacherDashboardView(APIView):
    """داشبورد متمرکز برای نقش استاد"""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request):
        user = request.user
        
        # ۱. تعداد محتواهای ایجاد شده توسط این استاد
        my_contents_count = LearningContent.objects.filter(author=user).count()
        
        # ۲. تعداد آزمون‌های مدیریت شده توسط این استاد
        # (آزمون‌هایی که یا مستقیماً به محتوای او وصل هستند یا او ساخته است)
        my_tests_count = CognitiveTest.objects.filter(
            models.Q(related_content__author=user) | models.Q(is_active=True)
        ).distinct().count()

        # ۳. تعداد آزمون‌های تشریحی در انتظار تصحیح
        pending_reviews_count = TestSession.objects.filter(
            status='pending_review'
        ).count()

        # ۴. آخرین آزمون‌های در انتظار تصحیح (برای دسترسی سریع)
        recent_pending = TestSession.objects.filter(
            status='pending_review'
        ).order_by('-started_at')[:5]
        
        from assessment.serializers import TestSessionSerializer
        recent_pending_data = TestSessionSerializer(recent_pending, many=True).data

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
    """داشبورد جامع شهروند با تحلیل ۱-۱۰۰ و وضعیت شناختی"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # ۱. به‌روزرسانی و دریافت وضعیت مهارت‌های شناختی (راداری)
        AnalyticsService.update_user_performance_summary(user)
        performance, _ = UserPerformanceSummary.objects.get_or_create(user=user)
        performance_data = UserPerformanceSummarySerializer(performance).data

        # ۲. وضعیت سطح و رتبه (بازه ۱-۱۰۰)
        level = user.cognitive_level or 1
        rank = self.get_rank(level)

        # ۳. وضعیت مسیر یادگیری (Learning Path)
        active_path = LearningPath.objects.filter(user=user, is_active=True).first()
        path_data = None
        if active_path:
            total_lessons = active_path.items.count()
            completed_lessons = UserContentProgress.objects.filter(
                user=user, 
                content__items__path=active_path, # اصلاح رابطه
                is_completed=True
            ).distinct().count()
            
            path_data = {
                "path_name": active_path.name,
                "progress_percent": round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0,
                "completed_count": completed_lessons,
                "total_count": total_lessons
            }

        # ۴. آخرین نتایج آزمون‌ها (۳ مورد آخر)
        recent_tests = TestSession.objects.filter(user=user).exclude(status='in_progress').order_by('-finished_at')[:3]
        tests_serialized = TestSessionSerializer(recent_tests, many=True).data

        # ۵. محتواهای پیشنهادی هوشمند (بر اساس سطح ۱-۱۰۰ کاربر)
        recommendations = ContentRecommendation.objects.filter(user=user).order_by('-priority_weight')[:3]
        recs_serialized = RecommendationSerializer(recommendations, many=True).data

        # ۶. پیام‌های سیستمی (مثلا اگر تعیین سطح نشده باشد)
        alerts = []
        if not user.has_taken_placement_test:
            alerts.append({"type": "warning", "message": "شما هنوز آزمون تعیین سطح اولیه را انجام نداده‌اید."})

        return Response({
            "identity": {
                "full_name": f"{user.first_name} {user.last_name}",
                "level": level,
                "rank": rank,
                "has_taken_placement": user.has_taken_placement_test,
            },
            "cognitive_profile": {
                "memory": performance_data['avg_memory_score'],
                "focus": performance_data['avg_focus_score'],
                "logic": performance_data['avg_logic_score'],
            },
            "learning_status": path_data,
            "top_recommendations": recs_serialized,
            "recent_test_results": tests_serialized,
            "alerts": alerts
        })

    def get_rank(self, level):
        """تعیین لقب بر اساس سطح ۱-۱۰۰"""
        if level >= 90: return "الماس شناختی"
        if level >= 75: return "طلایی"
        if level >= 50: return "نقره‌ای"
        if level >= 25: return "برنزی"
        return "نوآموز"    
    
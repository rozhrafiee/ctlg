from django.db.models import Avg
from .models import UserPerformanceSummary, LearningAnalytics
from assessment.models import Answer, TestSession

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
    def update_user_performance_summary(user):
        """محاسبه میانگین نمرات شناختی کاربر از تمام آزمون‌های تکمیل شده"""
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)
        
        # محاسبه میانگین نمرات بر اساس دسته‌بندی سوالات (حافظه، تمرکز، منطق)
        results = Answer.objects.filter(
            session__user=user, 
            session__status='completed'
        ).values('question__category').annotate(avg_score=Avg('score_earned'))

        for res in results:
            cat = res['question__category']
            score = res['avg_score']
            if cat == 'memory': summary.avg_memory_score = score
            elif cat == 'focus': summary.avg_focus_score = score
            elif cat == 'logic': summary.avg_logic_score = score

        summary.total_tests_completed = TestSession.objects.filter(
            user=user, 
            status='completed'
        ).count()
        summary.save()

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
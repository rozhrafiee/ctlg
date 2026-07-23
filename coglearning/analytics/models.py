from django.db import models
from django.conf import settings

class LevelHistory(models.Model):
    """تاریخچه تغییرات سطح کاربر (منتقل شده از اپلیکیشن accounts)"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="level_history"
    )
    old_level = models.IntegerField()
    new_level = models.IntegerField()
    # استفاده از رشته برای جلوگیری از چرخه وابستگی
    test_session = models.ForeignKey(
        'assessment.TestSession', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    reason = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

class LearningAnalytics(models.Model):
    """ثبت لاگ تمامی رویدادهای سیستم برای تحلیل رفتار کاربر"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100) # مثال: 'view_video', 'start_test'
    event_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

class UserPerformanceSummary(models.Model):
    """خلاصه وضعیت شناختی کاربر در دسته‌بندی‌های مختلف (۱-۱۰۰)"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="performance_summary"
    )
    avg_memory_score = models.FloatField(default=0)
    avg_focus_score = models.FloatField(default=0)
    avg_logic_score = models.FloatField(default=0)
    total_tests_completed = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Summary: {self.user.username}"
    def get_scores_map(self):
        return {
            'memory': self.avg_memory_score,
            'focus': self.avg_focus_score,
            'logic': self.avg_logic_score
        }


class UserAbandonmentSample(models.Model):
    """
    Training row for predicting whether a user abandons the system.

    Features:
      - avg_login_interval_days: average days between logins
      - duration_of_use_minutes: total/typical usage duration
      - failed_tests_count: number of failed tests
      - progress_rate: learning progress rate (0–1)
    Label:
      - abandoned: True if the user left the system
    """
    avg_login_interval_days = models.FloatField()
    duration_of_use_minutes = models.FloatField()
    failed_tests_count = models.PositiveIntegerField()
    progress_rate = models.FloatField(help_text='Learning progress rate between 0 and 1')
    abandoned = models.BooleanField()
    is_synthetic = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User abandonment sample'
        verbose_name_plural = 'User abandonment samples'

    def __str__(self):
        status = 'abandoned' if self.abandoned else 'retained'
        return f'Sample #{self.pk} ({status})'
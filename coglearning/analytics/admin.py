from django.contrib import admin

from .models import (
    LevelHistory,
    LearningAnalytics,
    UserPerformanceSummary,
    UserAbandonmentSample,
)


@admin.register(UserAbandonmentSample)
class UserAbandonmentSampleAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'avg_login_interval_days',
        'duration_of_use_minutes',
        'failed_tests_count',
        'progress_rate',
        'abandoned',
        'is_synthetic',
        'created_at',
    )
    list_filter = ('abandoned', 'is_synthetic')
    search_fields = ('id',)

from django.contrib import admin

from .models import (
    LevelHistory,
    LearningAnalytics,
    UserPerformanceSummary,
    UserAbandonmentSample,
)


@admin.register(UserPerformanceSummary)
class UserPerformanceSummaryAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'avg_memory_score',
        'avg_focus_score',
        'avg_logic_score',
        'avg_login_interval_days',
        'duration_of_use_minutes',
        'failed_tests_count',
        'progress_rate',
        'abandoned',
        'last_updated',
    )
    list_filter = ('abandoned',)
    search_fields = ('user__username',)


@admin.register(UserAbandonmentSample)
class UserAbandonmentSampleAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'avg_login_interval_days',
        'duration_of_use_minutes',
        'failed_tests_count',
        'progress_rate',
        'abandoned',
        'is_synthetic',
        'created_at',
    )
    list_filter = ('abandoned', 'is_synthetic')
    search_fields = ('user__username', 'id')


@admin.register(LevelHistory)
class LevelHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'old_level', 'new_level', 'reason', 'timestamp')
    search_fields = ('user__username',)


@admin.register(LearningAnalytics)
class LearningAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'timestamp')
    search_fields = ('user__username', 'event_type')

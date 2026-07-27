from django.contrib import admin
from .models import LevelHistory, LearningAnalytics, UserPerformanceSummary


@admin.register(LevelHistory)
class LevelHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'old_level', 'new_level', 'reason', 'timestamp')
    list_filter = ('reason',)
    search_fields = ('user__username',)


@admin.register(LearningAnalytics)
class LearningAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'timestamp')
    list_filter = ('event_type',)
    search_fields = ('user__username',)


@admin.register(UserPerformanceSummary)
class UserPerformanceSummaryAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'avg_memory_score',
        'avg_focus_score',
        'avg_logic_score',
        'total_tests_completed',
        'last_updated',
    )
    search_fields = ('user__username',)

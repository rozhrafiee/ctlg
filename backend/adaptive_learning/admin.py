# adaptive_learning/admin.py
from django.contrib import admin
from .models import LearningContent, LearningScenario, UserContentProgress


@admin.register(LearningContent)
class LearningContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'min_level', 'max_level', 'is_active', 'created_at')
    list_filter = ('content_type', 'is_active', 'min_level', 'max_level')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)


@admin.register(LearningScenario)
class LearningScenarioAdmin(admin.ModelAdmin):
    list_display = ('title', 'min_level', 'max_level')
    list_filter = ('min_level', 'max_level')
    search_fields = ('title', 'description')


@admin.register(UserContentProgress)
class UserContentProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'progress_percent', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('user__username', 'content__title')
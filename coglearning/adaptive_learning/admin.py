from django.contrib import admin
from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
)


class LearningPathItemInline(admin.TabularInline):
    model = LearningPathItem
    extra = 0


@admin.register(LearningContent)
class LearningContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'min_level', 'max_level', 'author', 'is_active')
    list_filter = ('content_type', 'is_active')
    search_fields = ('title',)


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'created_at')
    inlines = [LearningPathItemInline]


@admin.register(LearningPathItem)
class LearningPathItemAdmin(admin.ModelAdmin):
    list_display = ('path', 'content', 'order', 'is_unlocked')


@admin.register(UserContentProgress)
class UserContentProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'progress_percent', 'is_completed', 'last_accessed')
    list_filter = ('is_completed',)


@admin.register(ContentRecommendation)
class ContentRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'recommendation_type', 'priority_weight', 'is_clicked', 'created_at')
    list_filter = ('recommendation_type', 'is_clicked')

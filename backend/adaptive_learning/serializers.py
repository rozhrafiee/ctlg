from rest_framework import serializers
from django.utils import timezone

from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
    LearningAnalytics,
)

# =====================================================
# LEARNING CONTENT
# =====================================================


class LearningContentSerializer(serializers.ModelSerializer):
    """
    Serializer for learning content (student-facing)
    """
    class Meta:
        model = LearningContent
        fields = [
            "id",
            "title",
            "description",
            "content_type",
            "body",
            "min_level",
            "max_level",
            "difficulty",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# LEARNING PATH
# =====================================================


class LearningPathItemSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = LearningPathItem
        fields = [
            "id",
            "content",
            "order",
            "unlocked",
        ]


class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(
        many=True,
        read_only=True,
        source="learningpathitem_set"
    )
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = [
            "id",
            "name",
            "current_content",
            "is_active",
            "created_at",
            "items",
            "progress_percent",
        ]

    def get_progress_percent(self, obj):
        total = obj.learningpathitem_set.count()
        if total == 0:
            return 0

        completed = UserContentProgress.objects.filter(
            user=obj.user,
            completed_at__isnull=False,
            content__learningpathitem__learning_path=obj
        ).count()

        return round((completed / total) * 100, 1)


# =====================================================
# USER PROGRESS
# =====================================================


class UserContentProgressSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = UserContentProgress
        fields = [
            "id",
            "content",
            "progress_percent",
            "completed_at",
            "last_accessed",
        ]
        read_only_fields = ["id", "completed_at", "last_accessed"]


class ProgressUpdateSerializer(serializers.Serializer):
    """
    Input serializer for updating content progress
    """
    progress_percent = serializers.FloatField(min_value=0, max_value=100)
    completed = serializers.BooleanField(required=False, default=False)


# =====================================================
# RECOMMENDATIONS
# =====================================================


class ContentRecommendationSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = ContentRecommendation
        fields = [
            "id",
            "content",
            "reason",
            "priority",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# ANALYTICS (OPTIONAL / INTERNAL)
# =====================================================


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = [
            "id",
            "event_type",
            "event_data",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]

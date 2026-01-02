from rest_framework import serializers
from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
    LearningAnalytics,
)

class LearningContentSerializer(serializers.ModelSerializer):
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


class LearningPathItemSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = LearningPathItem
        fields = ["id", "content", "order", "unlocked"]


class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(
        many=True, read_only=True, source="learningpathitem_set"
    )

    class Meta:
        model = LearningPath
        fields = ["id", "name", "current_content", "is_active", "created_at", "items"]


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


class ProgressUpdateSerializer(serializers.Serializer):
    progress_percent = serializers.FloatField(min_value=0, max_value=100)
    completed = serializers.BooleanField(required=False, default=False)


class ContentRecommendationSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = ContentRecommendation
        fields = ["id", "content", "reason", "priority", "created_at"]


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = ["id", "event_type", "event_data", "timestamp"]

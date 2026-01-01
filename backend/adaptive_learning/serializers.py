from rest_framework import serializers
from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
)


class LearningContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningContent
        fields = "__all__"


class LearningPathItemSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = LearningPathItem
        fields = ["id", "content", "order", "unlocked"]


class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(
        many=True, read_only=True, source="learningpathitem_set"
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
            content__learningpathitem__learning_path=obj,
        ).distinct().count()

        return round((completed / total) * 100, 1)


class UserContentProgressSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = UserContentProgress
        fields = "__all__"


class ProgressUpdateSerializer(serializers.Serializer):
    progress_percent = serializers.FloatField(min_value=0, max_value=100)
    completed = serializers.BooleanField(default=False)


class ContentRecommendationSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = ContentRecommendation
        fields = "__all__"

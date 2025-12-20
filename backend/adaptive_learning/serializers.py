from rest_framework import serializers

from .models import LearningContent, LearningScenario, UserContentProgress


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
            "is_active",
        ]


class LearningScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningScenario
        fields = [
            "id",
            "title",
            "description",
            "json_structure",
            "min_level",
            "max_level",
        ]


class UserContentProgressSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)

    class Meta:
        model = UserContentProgress
        fields = [
            "id",
            "content",
            "started_at",
            "completed_at",
            "progress_percent",
        ]


class ProgressUpdateSerializer(serializers.Serializer):
    progress_percent = serializers.FloatField(min_value=0, max_value=100)
    completed = serializers.BooleanField(default=False)


class LearningContentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningContent
        fields = [
            "title",
            "description",
            "content_type",
            "body",
            "min_level",
            "max_level",
            "is_active",
        ]



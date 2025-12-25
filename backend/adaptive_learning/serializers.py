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
        extra_kwargs = {
            "title": {"required": True},
            "content_type": {"required": True},
            "min_level": {"required": True},
            "max_level": {"required": True},
        }

    def validate_content_type(self, value):
        valid_types = ["text", "image", "video", "scenario"]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"content_type must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate(self, data):
        min_level = data.get("min_level", 1)
        max_level = data.get("max_level", 10)
        
        if min_level < 1 or min_level > 10:
            raise serializers.ValidationError("min_level must be between 1 and 10")
        
        if max_level < 1 or max_level > 10:
            raise serializers.ValidationError("max_level must be between 1 and 10")
        
        if min_level > max_level:
            raise serializers.ValidationError("min_level cannot be greater than max_level")
        
        return data



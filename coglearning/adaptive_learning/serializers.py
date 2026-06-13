from rest_framework import serializers
from .models import LearningContent, LearningPath, LearningPathItem, UserContentProgress, ContentRecommendation

class LearningContentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    related_test_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LearningContent
        fields = [
            'id', 'title', 'content_type', 'body', 'file', 'video_url',
            'min_level', 'max_level', 'author', 'is_active', 'created_at',
            'file_url', 'related_test_id',
        ]
        read_only_fields = ['author']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_related_test_id(self, obj):
        from assessment.models import CognitiveTest
        t = CognitiveTest.objects.filter(related_content=obj).first()
        return t.id if t else None

class LearningPathItemSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)
    class Meta:
        model = LearningPathItem
        fields = ['id', 'content', 'order', 'is_unlocked']

class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(many=True, read_only=True)
    class Meta:
        model = LearningPath
        fields = ['id', 'name', 'is_active', 'items']

class UserContentProgressSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source='content.title', read_only=True)
    class Meta:
        model = UserContentProgress
        fields = '__all__'

class RecommendationSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)
    class Meta:
        model = ContentRecommendation
        fields = '__all__'
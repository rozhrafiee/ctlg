from rest_framework import serializers
from .models import LearningContent, LearningPath, LearningPathItem, UserContentProgress, ContentRecommendation

class LearningContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningContent
        fields = '__all__'
        read_only_fields = ['author']

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
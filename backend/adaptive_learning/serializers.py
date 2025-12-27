from rest_framework import serializers
from django.utils import timezone
from .models import (
    LearningContent, 
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    LearningAnalytics,
    ContentRecommendation
)


class LearningContentSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    current_progress = serializers.SerializerMethodField()
    time_spent_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningContent
        fields = [
            'id', 'title', 'description', 'content_type', 'body',
            'min_level', 'max_level', 'difficulty', 'estimated_time_minutes',
            'tags', 'is_active', 'order', 'avg_completion_time',
            'success_rate', 'popularity_score', 'is_completed',
            'current_progress', 'time_spent_minutes', 'created_at'
        ]
        read_only_fields = [
            'id', 'avg_completion_time', 'success_rate', 
            'popularity_score', 'created_at'
        ]
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserContentProgress.objects.filter(
                user=request.user,
                content=obj,
                progress_percent=100
            ).first()
            return bool(progress)
        return False
    
    def get_current_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserContentProgress.objects.filter(
                user=request.user,
                content=obj
            ).first()
            return progress.progress_percent if progress else 0
        return 0
    
    def get_time_spent_minutes(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserContentProgress.objects.filter(
                user=request.user,
                content=obj
            ).first()
            return progress.time_spent_seconds // 60 if progress and progress.time_spent_seconds else 0
        return 0


class LearningContentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningContent
        fields = [
            'title', 'description', 'content_type', 'body',
            'min_level', 'max_level', 'difficulty', 'estimated_time_minutes',
            'prerequisites', 'tags', 'is_active', 'order'
        ]


class LearningPathItemSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)
    content_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = LearningPathItem
        fields = [
            'id', 'content', 'content_id', 'order', 'required',
            'unlocked', 'completed', 'completed_at', 'score'
        ]
        read_only_fields = ['completed', 'completed_at', 'score']


class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(many=True, read_only=True, source='learningpathitem_set')
    progress_percent = serializers.SerializerMethodField()
    estimated_total_time = serializers.SerializerMethodField()
    current_content_info = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningPath
        fields = [
            'id', 'name', 'items', 'current_content', 'is_active',
            'completed', 'progress_percent', 'estimated_total_time',
            'current_content_info', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_progress_percent(self, obj):
        total_items = obj.learningpathitem_set.count()
        if total_items == 0:
            return 0
        
        completed_items = obj.learningpathitem_set.filter(completed=True).count()
        return (completed_items / total_items) * 100
    
    def get_estimated_total_time(self, obj):
        total_time = 0
        for item in obj.learningpathitem_set.all():
            total_time += item.content.estimated_time_minutes
        return total_time
    
    def get_current_content_info(self, obj):
        if obj.current_content:
            serializer = LearningContentSerializer(
                obj.current_content,
                context=self.context
            )
            return serializer.data
        return None


class UserContentProgressSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)
    time_spent_hours = serializers.SerializerMethodField()
    efficiency_score = serializers.SerializerMethodField()
    
    class Meta:
        model = UserContentProgress
        fields = [
            'id', 'user', 'content', 'started_at', 'last_accessed',
            'completed_at', 'progress_percent', 'time_spent_seconds',
            'time_spent_hours', 'notes', 'rating', 'difficulty_feedback',
            'efficiency_score'
        ]
        read_only_fields = [
            'id', 'user', 'content', 'started_at', 'last_accessed'
        ]
    
    def get_time_spent_hours(self, obj):
        return round(obj.time_spent_seconds / 3600, 2)
    
    def get_efficiency_score(self, obj):
        if obj.progress_percent > 0 and obj.time_spent_seconds > 0:
            # Higher score = faster learning
            return round((obj.progress_percent / 100) / (obj.time_spent_seconds / 3600), 2)
        return 0


class ProgressUpdateSerializer(serializers.Serializer):
    progress_percent = serializers.FloatField(min_value=0, max_value=100, required=True)
    time_spent_seconds = serializers.IntegerField(min_value=0, default=0)
    completed = serializers.BooleanField(default=False)
    interactions = serializers.JSONField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    difficulty_feedback = serializers.IntegerField(min_value=1, max_value=10, required=False)


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = [
            'id', 'user', 'content', 'session_id', 'event_type',
            'event_data', 'learning_path_id', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class ContentRecommendationSerializer(serializers.ModelSerializer):
    content = LearningContentSerializer(read_only=True)
    days_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentRecommendation
        fields = [
            'id', 'content', 'reason', 'confidence_score',
            'priority', 'shown_at', 'clicked', 'days_ago'
        ]
        read_only_fields = ['id', 'content', 'reason', 'confidence_score', 'priority']
    
    def get_days_ago(self, obj):
        if obj.shown_at:
            delta = timezone.now() - obj.shown_at
            return delta.days
        return None


class AdaptiveLearningDashboardSerializer(serializers.Serializer):
    current_level = serializers.IntegerField()
    learning_path = LearningPathSerializer()
    recommendations = ContentRecommendationSerializer(many=True)
    recent_progress = UserContentProgressSerializer(many=True)
    stats = serializers.DictField()
    suggested_next = LearningContentSerializer()
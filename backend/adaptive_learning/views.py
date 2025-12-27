from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db.models import Count, Avg, Sum, Max, Min, Q
import logging

from .permissions import IsTeacherForAdaptiveLearning
from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
    LearningAnalytics
)
from .serializers import (
    LearningContentSerializer,
    LearningContentCreateSerializer,
    LearningPathSerializer,
    UserContentProgressSerializer,
    ProgressUpdateSerializer,
    ContentRecommendationSerializer,
    AdaptiveLearningDashboardSerializer
)
from .services import (
    AdaptiveLearningEngine,
    get_adaptive_dashboard_data,  
    log_learning_analytics,        
    update_recommendations_after_test
)

logger = logging.getLogger(__name__)


class AdaptiveLearningDashboardView(generics.GenericAPIView):
    """Complete adaptive learning dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            dashboard_data = get_adaptive_dashboard_data(request.user)
            
            # Track dashboard view
            log_learning_analytics(
                user=request.user,
                event_type="dashboard_view",
                event_data={"view": "adaptive_dashboard"}
            )
            
            # Serialize data
            serializer = AdaptiveLearningDashboardSerializer(dashboard_data)
            return Response(serializer.data)
        
        except Exception as e:
            logger.error(f"Error in adaptive learning dashboard: {str(e)}")
            return Response(
                {"error": "خطا در دریافت اطلاعات داشبورد"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecommendedContentView(generics.ListAPIView):
    """Personalized content recommendations"""
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        engine = AdaptiveLearningEngine(self.request.user)
        return engine.get_recommended_content(limit=20)
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Track recommendation view
        log_learning_analytics(
            user=request.user,
            event_type="recommendations_view",
            event_data={"count": len(response.data)}
        )
        
        return response


class LearningContentDetailView(generics.RetrieveAPIView):
    """Get content details with personalized difficulty"""
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LearningContent.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        
        # Add personalized difficulty calculation
        if self.request.user.is_authenticated:
            engine = AdaptiveLearningEngine(self.request.user)
            content = self.get_object()
            difficulty = engine.calculate_content_difficulty_for_user(content)
            context['personalized_difficulty'] = difficulty
        
        return context
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        
        # Track content view
        content = self.get_object()
        log_learning_analytics(
            user=request.user,
            event_type="content_view",
            event_data={
                "content_id": content.id,
                "content_type": content.content_type,
                "difficulty": content.difficulty
            },
            content=content
        )
        
        return response


class LearningPathView(generics.RetrieveAPIView):
    """Get or create learning path for user"""
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create learning path
        learning_path = LearningPath.objects.filter(
            user=self.request.user,
            is_active=True
        ).first()
        
        if not learning_path:
            engine = AdaptiveLearningEngine(self.request.user)
            learning_path = engine.create_learning_path()
        
        return learning_path


class LearningPathUpdateView(generics.UpdateAPIView):
    """Update learning path (mark complete, change current content)"""
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Log learning path update
        log_learning_analytics(
            user=self.request.user,
            event_type="learning_path_update",
            event_data={
                "path_id": instance.id,
                "current_content": instance.current_content_id,
                "completed": instance.completed
            }
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def update_progress(request, content_id: int):
    """Update progress on learning content"""
    content = get_object_or_404(LearningContent, pk=content_id, is_active=True)
    
    serializer = ProgressUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    
    # Get or create progress record
    progress, created = UserContentProgress.objects.get_or_create(
        user=request.user, 
        content=content,
        defaults={
            'progress_percent': data['progress_percent'],
            'time_spent_seconds': data.get('time_spent_seconds', 0)
        }
    )
    
    if not created:
        # Update existing progress
        progress.progress_percent = data['progress_percent']
        progress.time_spent_seconds += data.get('time_spent_seconds', 0)
        progress.last_accessed = timezone.now()
        
        if data.get('completed'):
            progress.completed_at = timezone.now()
            progress.progress_percent = 100.0
        
        if 'notes' in data:
            progress.notes = data['notes']
        
        if 'rating' in data:
            progress.rating = data['rating']
        
        if 'difficulty_feedback' in data:
            progress.difficulty_feedback = data['difficulty_feedback']
        
        if 'interactions' in data:
            progress.interactions = data['interactions']
    
    progress.save()
    
    # Update content analytics if completed
    if data.get('completed'):
        from .services import AdaptiveLearningEngine
        engine = AdaptiveLearningEngine(request.user)
        engine.update_content_difficulty(content)
    
    # Log progress update
    log_learning_analytics(
        user=request.user,
        event_type="progress_update",
        event_data={
            "content_id": content.id,
            "progress_percent": progress.progress_percent,
            "completed": bool(progress.completed_at),
            "time_spent": progress.time_spent_seconds
        },
        content=content
    )
    
    return Response(UserContentProgressSerializer(progress).data)


class UserProgressListView(generics.ListAPIView):
    """List user's content progress"""
    serializer_class = UserContentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserContentProgress.objects.filter(
            user=self.request.user
        ).select_related('content').order_by('-last_accessed')


class RecommendationsListView(generics.ListAPIView):
    """List content recommendations for user"""
    serializer_class = ContentRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ContentRecommendation.objects.filter(
            user=self.request.user,
            shown_at__isnull=True
        ).select_related('content').order_by('-priority', '-confidence_score')
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Mark recommendations as shown
        recommendation_ids = [item['id'] for item in response.data]
        ContentRecommendation.objects.filter(
            id__in=recommendation_ids
        ).update(shown_at=timezone.now())
        
        return response


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_recommendation_clicked(request, recommendation_id: int):
    """Mark a recommendation as clicked"""
    recommendation = get_object_or_404(
        ContentRecommendation,
        pk=recommendation_id,
        user=request.user
    )
    
    recommendation.clicked = True
    recommendation.save()
    
    # Log click event
    log_learning_analytics(
        user=request.user,
        event_type="recommendation_click",
        event_data={
            "recommendation_id": recommendation.id,
            "content_id": recommendation.content_id,
            "reason": recommendation.reason
        },
        content=recommendation.content
    )
    
    return Response({"status": "success"})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reset_learning_path(request):
    """Reset user's learning path"""
    # Deactivate current path
    LearningPath.objects.filter(
        user=request.user,
        is_active=True
    ).update(is_active=False)
    
    # Create new path
    engine = AdaptiveLearningEngine(request.user)
    new_path = engine.create_learning_path()
    
    # Log reset event
    log_learning_analytics(
        user=request.user,
        event_type="learning_path_reset",
        event_data={
            "new_path_id": new_path.id,
            "goal_level": new_path.name
        }
    )
    
    return Response({
        "message": "مسیر یادگیری جدید ایجاد شد",
        "learning_path": LearningPathSerializer(new_path).data
    })


# ========== TEACHER VIEWS ==========

class TeacherContentListView(generics.ListAPIView):
    """List all content (for teachers)"""
    serializer_class = LearningContentSerializer
    permission_classes = [IsTeacherForAdaptiveLearning]
    
    def get_queryset(self):
        # Teachers see all content (active and inactive)
        return LearningContent.objects.all().order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class LearningContentCreateView(generics.CreateAPIView):
    """Create new learning content (for teachers)"""
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentCreateSerializer
    permission_classes = [IsTeacherForAdaptiveLearning]
    
    def perform_create(self, serializer):
        content = serializer.save()
        
        # Log content creation
        log_learning_analytics(
            user=self.request.user,
            event_type="content_created",
            event_data={
                "content_id": content.id,
                "content_type": content.content_type,
                "difficulty": content.difficulty
            },
            content=content
        )


class LearningContentUpdateView(generics.UpdateAPIView):
    """Update learning content (for teachers)"""
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentCreateSerializer
    permission_classes = [IsTeacherForAdaptiveLearning]
    
    def perform_update(self, serializer):
        content = serializer.save()
        
        # Log content update
        log_learning_analytics(
            user=self.request.user,
            event_type="content_updated",
            event_data={
                "content_id": content.id,
                "updated_fields": list(serializer.validated_data.keys())
            },
            content=content
        )


class LearningContentDeleteView(generics.DestroyAPIView):
    """Delete learning content (for teachers)"""
    queryset = LearningContent.objects.all()
    permission_classes = [IsTeacherForAdaptiveLearning]
    
    def perform_destroy(self, instance):
        content_id = instance.id
        instance.delete()
        
        # Log content deletion
        log_learning_analytics(
            user=self.request.user,
            event_type="content_deleted",
            event_data={"content_id": content_id}
        )


class TeacherAnalyticsView(generics.GenericAPIView):
    """Analytics dashboard for teachers"""
    permission_classes = [IsTeacherForAdaptiveLearning]
    
    def get(self, request):
        try:
            # Get content performance analytics
            content_stats = LearningContent.objects.annotate(
                total_users=Count('usercontentprogress'),
                completed_users=Count('usercontentprogress', filter=Q(usercontentprogress__progress_percent=100)),
                avg_time=Avg('usercontentprogress__time_spent_seconds'),
                avg_rating=Avg('usercontentprogress__rating')
            ).order_by('-popularity_score')
            
            # Get user progress analytics
            user_progress_stats = {
                "total_users": request.user._meta.model.objects.count(),
                "active_users": UserContentProgress.objects.filter(
                    last_accessed__gte=timezone.now() - timezone.timedelta(days=7)
                ).values('user').distinct().count(),
                "avg_completion_rate": UserContentProgress.objects.filter(
                    progress_percent=100
                ).count() / UserContentProgress.objects.count() * 100 if UserContentProgress.objects.exists() else 0,
            }
            
            # Get learning path analytics
            path_stats = {
                "total_paths": LearningPath.objects.count(),
                "completed_paths": LearningPath.objects.filter(completed=True).count(),
                "avg_path_length": LearningPathItem.objects.count() / LearningPath.objects.count() if LearningPath.objects.exists() else 0,
            }
            
            return Response({
                "content_performance": [
                    {
                        "id": content.id,
                        "title": content.title,
                        "completion_rate": (content.completed_users / content.total_users * 100) if content.total_users > 0 else 0,
                        "avg_time_minutes": (content.avg_time or 0) / 60,
                        "avg_rating": content.avg_rating or 0,
                        "difficulty": content.difficulty,
                        "success_rate": content.success_rate
                    }
                    for content in content_stats[:20]
                ],
                "user_progress": user_progress_stats,
                "learning_paths": path_stats,
                "top_recommendations": ContentRecommendation.objects.values('reason').annotate(
                    count=Count('id'),
                    click_rate=Avg('clicked') * 100
                ).order_by('-count')[:5]
            })
        
        except Exception as e:
            logger.error(f"Error in teacher analytics: {str(e)}")
            return Response(
                {"error": "خطا در دریافت آمار"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(["GET"])
@permission_classes([IsTeacherForAdaptiveLearning])
def get_content_analytics(request, content_id: int):
    """Detailed analytics for specific content"""
    content = get_object_or_404(LearningContent, pk=content_id)
    
    # Get user progress for this content
    user_progress = UserContentProgress.objects.filter(content=content).select_related('user')
    
    # Calculate statistics
    stats = user_progress.aggregate(
        total_users=Count('id'),
        completed_users=Count('id', filter=Q(progress_percent=100)),
        avg_progress=Avg('progress_percent'),
        avg_time=Avg('time_spent_seconds'),
        avg_rating=Avg('rating'),
        avg_difficulty_feedback=Avg('difficulty_feedback')
    )
    
    # Get completion time distribution
    completion_times = user_progress.filter(
        completed_at__isnull=False
    ).values_list('time_spent_seconds', flat=True)
    
    # Get recent interactions
    recent_events = LearningAnalytics.objects.filter(
        content=content
    ).order_by('-timestamp')[:10]
    
    return Response({
        "content": {
            "id": content.id,
            "title": content.title,
            "difficulty": content.difficulty,
            "estimated_time": content.estimated_time_minutes,
            "success_rate": content.success_rate,
            "popularity": content.popularity_score
        },
        "statistics": stats,
        "completion_time_distribution": {
            "min": min(completion_times) if completion_times else 0,
            "max": max(completion_times) if completion_times else 0,
            "avg": stats['avg_time'] or 0
        },
        "recent_events": [
            {
                "user": event.user.username,
                "event_type": event.event_type,
                "timestamp": event.timestamp,
                "data": event.event_data
            }
            for event in recent_events
        ]
    })
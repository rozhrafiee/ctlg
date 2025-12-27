from typing import List, Dict, Optional
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
from django.db import transaction
from django.core.cache import cache
import logging
from datetime import timedelta

from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
    LearningAnalytics
)
from assessment.models import TestSession, CognitiveTest, Answer

logger = logging.getLogger(__name__)


class AdaptiveLearningEngine:
    """Core engine for adaptive learning decisions"""
    
    def __init__(self, user):
        self.user = user
        self.user_level = getattr(user, 'cognitive_level', 1)
    
    def get_recommended_content(self, limit: int = 10) -> List[LearningContent]:
        """Get personalized content recommendations"""
        cache_key = f"recommendations_{self.user.id}"
        
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Filter by user level
        base_query = LearningContent.objects.filter(
            is_active=True,
            min_level__lte=self.user_level,
            max_level__gte=self.user_level
        )
        
        # Exclude completed content
        completed_ids = UserContentProgress.objects.filter(
            user=self.user,
            progress_percent=100
        ).values_list('content_id', flat=True)
        
        available = base_query.exclude(id__in=completed_ids)
        
        # Score content based on multiple factors
        scored = []
        for content in available:
            score = self._score_content(content)
            scored.append((score, content))
        
        # Sort and get top recommendations
        scored.sort(key=lambda x: x[0], reverse=True)
        recommendations = [content for _, content in scored[:limit]]
        
        # Ensure prerequisites are met
        final_recommendations = []
        for content in recommendations:
            if self._check_prerequisites(content):
                final_recommendations.append(content)
                if len(final_recommendations) >= limit:
                    break
        
        cache.set(cache_key, final_recommendations, timeout=600)
        return final_recommendations
    
    def _score_content(self, content: LearningContent) -> float:
        """Score content for recommendation (0-100)"""
        score = 0.0
        
        # 1. Level appropriateness (40%)
        level_diff = abs(content.difficulty - self.user_level)
        if level_diff == 0:
            score += 40
        elif level_diff == 1:
            score += 30
        elif level_diff == 2:
            score += 20
        else:
            score += 10
        
        # 2. Popularity (20%)
        score += (content.popularity_score / 100) * 20
        
        # 3. Success rate (20%)
        score += (content.success_rate / 100) * 20
        
        # 4. Recent user preference (20%)
        recent_types = self._get_preferred_content_types()
        if content.content_type in recent_types:
            score += 20
        
        return min(100, score)
    
    def _get_preferred_content_types(self) -> List[str]:
        """Get user's preferred content types from recent activity"""
        recent = UserContentProgress.objects.filter(
            user=self.user,
            last_accessed__gte=timezone.now() - timedelta(days=7)
        ).select_related('content')[:10]
        
        types = {}
        for prog in recent:
            ct = prog.content.content_type
            types[ct] = types.get(ct, 0) + 1
        
        # Return top 2 preferred types
        return [t for t, _ in sorted(types.items(), key=lambda x: x[1], reverse=True)[:2]]
    
    def _check_prerequisites(self, content: LearningContent) -> bool:
        """Check if user has completed prerequisites"""
        prerequisites = content.prerequisites.all()
        if not prerequisites:
            return True
        
        completed = UserContentProgress.objects.filter(
            user=self.user,
            content__in=prerequisites,
            progress_percent=100
        ).count()
        
        return completed == prerequisites.count()
    
    def create_learning_path(self, goal_level: int = None) -> LearningPath:
        """Create personalized learning path"""
        if not goal_level:
            goal_level = min(self.user_level + 2, 10)
        
        # Deactivate old paths
        LearningPath.objects.filter(
            user=self.user,
            is_active=True
        ).update(is_active=False)
        
        # Create new path
        path = LearningPath.objects.create(
            user=self.user,
            name=f"Path to Level {goal_level}",
            is_active=True
        )
        
        # Get content sequence
        sequence = self._generate_sequence(goal_level)
        
        # Add to path
        for order, content in enumerate(sequence, 1):
            LearningPathItem.objects.create(
                learning_path=path,
                content=content,
                order=order,
                unlocked=order == 1
            )
        
        # Set current content
        if sequence:
            path.current_content = sequence[0]
            path.save()
        
        return path
    
    def _generate_sequence(self, goal_level: int) -> List[LearningContent]:
        """Generate learning sequence"""
        sequence = []
        current_level = self.user_level
        
        while current_level < goal_level:
            # Get appropriate content
            content = LearningContent.objects.filter(
                is_active=True,
                min_level__lte=current_level,
                max_level__gte=current_level,
                difficulty__range=(current_level, current_level + 1)
            ).exclude(
                id__in=UserContentProgress.objects.filter(
                    user=self.user,
                    progress_percent=100
                ).values_list('content_id', flat=True)
            ).order_by('difficulty', 'order').first()
            
            if not content:
                current_level += 0.5
                continue
            
            sequence.append(content)
            
            # Progress estimation
            if content.difficulty >= current_level:
                current_level += 0.5
            else:
                current_level += 0.3
            
            if current_level >= goal_level or len(sequence) >= 10:
                break
        
        return sequence
    
    def get_next_content(self) -> Optional[LearningContent]:
        """Get next content for user"""
        # Check active learning path
        path = LearningPath.objects.filter(
            user=self.user,
            is_active=True,
            completed=False
        ).first()
        
        if path and path.current_content:
            # Check if current content is completed
            progress = UserContentProgress.objects.filter(
                user=self.user,
                content=path.current_content,
                progress_percent=100
            ).exists()
            
            if not progress:
                return path.current_content
            
            # Get next item in path
            next_item = LearningPathItem.objects.filter(
                learning_path=path,
                order__gt=path.learningpathitem_set.filter(
                    content=path.current_content
                ).first().order,
                unlocked=True,
                completed=False
            ).order_by('order').first()
            
            if next_item:
                path.current_content = next_item.content
                path.save()
                return next_item.content
        
        # Get recommendation
        recommendations = self.get_recommended_content(limit=1)
        return recommendations[0] if recommendations else None


def update_recommendations_after_test(user, test_session: TestSession):
    """Update recommendations based on test results"""
    # Clear old recommendations
    ContentRecommendation.objects.filter(user=user).delete()
    
    if test_session.passed:
        if test_session.total_score >= 90:
            # Excellent - advanced content
            reason = "advanced"
            priority = 10
        elif test_session.total_score >= 70:
            # Good - continue
            reason = "continue"
            priority = 7
        else:
            # Passed but low - reinforcement
            reason = "reinforcement"
            priority = 5
        
        engine = AdaptiveLearningEngine(user)
        recommendations = engine.get_recommended_content(limit=5)
    
    else:
        # Failed - remedial content
        reason = "remedial"
        priority = 8
        
        # Get related content for failed test
        related_content = test_session.test.related_content
        if related_content:
            # Find similar content
            recommendations = LearningContent.objects.filter(
                is_active=True,
                tags__overlap=getattr(related_content, 'tags', []),
                difficulty__lte=user.cognitive_level
            ).exclude(
                id__in=UserContentProgress.objects.filter(
                    user=user,
                    progress_percent=100
                ).values_list('content_id', flat=True)
            ).order_by('difficulty')[:5]
        else:
            recommendations = []
    
    # Create new recommendations
    for content in recommendations:
        ContentRecommendation.objects.create(
            user=user,
            content=content,
            reason=reason,
            confidence_score=0.8,
            priority=priority
        )
    
    # Clear cache
    cache.delete(f"recommendations_{user.id}")


def update_content_progress(user, content: LearningContent, 
                           progress_percent: float, 
                           time_spent_seconds: int,
                           completed: bool = False):
    """Update user progress on content"""
    progress, created = UserContentProgress.objects.get_or_create(
        user=user,
        content=content,
        defaults={
            'progress_percent': progress_percent,
            'time_spent_seconds': time_spent_seconds,
            'last_accessed': timezone.now()
        }
    )
    
    if not created:
        progress.progress_percent = max(progress.progress_percent, progress_percent)
        progress.time_spent_seconds += time_spent_seconds
        progress.last_accessed = timezone.now()
        
        if completed:
            progress.completed_at = timezone.now()
            progress.progress_percent = 100.0
    
    progress.save()
    
    # Update content analytics if completed
    if completed or progress_percent == 100:
        _update_content_analytics(content)
    
    return progress


def _update_content_analytics(content: LearningContent):
    """Update content analytics"""
    stats = UserContentProgress.objects.filter(
        content=content
    ).aggregate(
        total_users=Count('id'),
        completed_users=Count('id', filter=Q(progress_percent=100)),
        avg_time=Avg('time_spent_seconds')
    )
    
    if stats['total_users']:
        success_rate = (stats['completed_users'] / stats['total_users']) * 100
        
        content.success_rate = success_rate
        content.avg_completion_time = stats['avg_time'] or 0
        
        # Adjust difficulty
        if success_rate > 85:
            content.difficulty = min(10, content.difficulty + 1)
        elif success_rate < 20:
            content.difficulty = max(1, content.difficulty - 1)
        
        content.save()


def get_adaptive_dashboard_data(user):
    """Get adaptive learning dashboard data"""
    engine = AdaptiveLearningEngine(user)
    
    # Get learning path
    learning_path = LearningPath.objects.filter(
        user=user,
        is_active=True
    ).first()
    
    # Get recommendations
    recommendations = ContentRecommendation.objects.filter(
        user=user,
        shown_at__isnull=True
    ).select_related('content').order_by('-priority')[:10]
    
    # Get recent progress
    recent_progress = UserContentProgress.objects.filter(
        user=user
    ).select_related('content').order_by('-last_accessed')[:5]
    
    # Get next content
    next_content = engine.get_next_content()
    
    # Calculate stats
    total_content = LearningContent.objects.filter(is_active=True).count()
    completed = UserContentProgress.objects.filter(
        user=user,
        progress_percent=100
    ).count()
    
    total_time = UserContentProgress.objects.filter(
        user=user
    ).aggregate(total=Sum('time_spent_seconds'))['total'] or 0
    
    return {
        "current_level": user.cognitive_level,
        "learning_path": learning_path,
        "recommendations": recommendations,
        "recent_progress": recent_progress,
        "next_content": next_content,
        "stats": {
            "total_content": total_content,
            "completed": completed,
            "completion_rate": round((completed / total_content * 100), 1) if total_content > 0 else 0,
            "total_hours": round(total_time / 3600, 1),
        }
    }


def log_learning_analytics(user, event_type: str, event_data: Dict, 
                          content: LearningContent = None):
    """Log learning analytics event"""
    try:
        LearningAnalytics.objects.create(
            user=user,
            content=content,
            event_type=event_type,
            event_data=event_data,
            timestamp=timezone.now()
        )
    except Exception as e:
        logger.error(f"Error logging analytics: {str(e)}")


def create_initial_learning_path(user):
    """Create initial learning path for new user"""
    engine = AdaptiveLearningEngine(user)
    return engine.create_learning_path()


# Signal handler for test completion
def handle_test_completion(sender, instance, created, **kwargs):
    """Update learning after test completion"""
    if instance.finished_at and instance.passed:
        update_recommendations_after_test(instance.user, instance)
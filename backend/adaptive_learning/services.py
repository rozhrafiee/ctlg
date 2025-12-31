from typing import List, Dict, Optional
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
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

logger = logging.getLogger(__name__)


class AdaptiveLearningEngine:
    """
    Core engine for adaptive learning decisions
    """

    def __init__(self, user):
        self.user = user
        self.user_level = getattr(user, "cognitive_level", 1)

    def create_learning_path(self, goal_level: int | None = None) -> LearningPath:
        """
        Create a personalized learning path for a user
        """
        if goal_level is None:
            goal_level = min(self.user_level + 2, 10)

        # deactivate old paths
        LearningPath.objects.filter(
            user=self.user,
            is_active=True
        ).update(is_active=False)

        path = LearningPath.objects.create(
            user=self.user,
            name=f"Path to Level {goal_level}",
            is_active=True
        )

        contents = LearningContent.objects.filter(
            is_active=True,
            min_level__lte=self.user_level,
            max_level__gte=self.user_level
        ).order_by("difficulty")[:10]

        for order, content in enumerate(contents, start=1):
            LearningPathItem.objects.create(
                learning_path=path,
                content=content,
                order=order,
                unlocked=(order == 1)
            )

        if contents:
            path.current_content = contents[0]
            path.save(update_fields=["current_content"])

        return path


# ✅ SINGLE, CANONICAL ENTRY POINT
def create_initial_learning_path(user):
    """
    Create initial learning path for a newly created user.
    SAFE to call from signals.
    """
    try:
        engine = AdaptiveLearningEngine(user)
        engine.create_learning_path()
    except Exception as e:
        logger.error(f"Failed to create initial learning path for user {user.id}: {e}")

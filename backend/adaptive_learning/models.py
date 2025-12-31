from django.conf import settings
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

from assessment.models import TestSession


class LearningContent(models.Model):
    CONTENT_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("scenario", "Scenario"),
        ("interactive", "Interactive"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    body = models.TextField(blank=True)
    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=10)
    difficulty = models.IntegerField(default=4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class LearningPath(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    current_content = models.ForeignKey(
        LearningContent,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class LearningPathItem(models.Model):
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    order = models.IntegerField()
    unlocked = models.BooleanField(default=False)


class UserContentProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    progress_percent = models.FloatField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)


class LearningAnalytics(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    event_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)


class ContentRecommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


# ==================== FIXED SIGNAL ====================

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_initial_learning_path_signal(sender, instance, created, **kwargs):
    """
    Create initial learning path for new users.
    SAFE, correct import, no crash.
    """
    if not created:
        return

    if not hasattr(instance, "cognitive_level"):
        return

    from .services import create_initial_learning_path
    create_initial_learning_path(instance)

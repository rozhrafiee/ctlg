from django.conf import settings
from django.db import models
from django.utils import timezone


class LearningContent(models.Model):
    CONTENT_TYPES = (
        ("text", "Text"),
        ("video", "Video"),
        ("image", "Image"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    body = models.TextField(blank=True)

    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=10)
    difficulty = models.IntegerField(default=1)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class LearningPath(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default="My Learning Path")
    current_content = models.ForeignKey(
        LearningContent, null=True, blank=True, on_delete=models.SET_NULL
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class LearningPathItem(models.Model):
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    unlocked = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        unique_together = ("learning_path", "content")


class UserContentProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)

    progress_percent = models.FloatField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    time_spent_seconds = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "content")


class ContentRecommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255, blank=True)
    priority = models.IntegerField(default=0)
    clicked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class LearningAnalytics(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(
        LearningContent, null=True, blank=True, on_delete=models.SET_NULL
    )
    event_type = models.CharField(max_length=50)
    event_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

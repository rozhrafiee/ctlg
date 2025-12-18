from django.conf import settings
from django.db import models


class LearningContent(models.Model):
    CONTENT_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("scenario", "Scenario"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    body = models.TextField(
        help_text="For text: plain text/HTML, for image/video: URL, for scenario: JSON.",
        blank=True,
    )
    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.title


class LearningScenario(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    json_structure = models.JSONField()
    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=10)

    def __str__(self) -> str:
        return self.title


class UserContentProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percent = models.FloatField(default=0)

    class Meta:
        unique_together = ("user", "content")



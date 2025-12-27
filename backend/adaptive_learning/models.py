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
    
    DIFFICULTY_LEVELS = (
        (1, "Very Easy"),
        (2, "Easy"),
        (3, "Medium Easy"),
        (4, "Medium"),
        (5, "Medium Hard"),
        (6, "Hard"),
        (7, "Very Hard"),
        (8, "Expert"),
        (9, "Master"),
        (10, "Genius"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    body = models.TextField(
        help_text="For text: plain text/HTML, for image/video: URL, for scenario: JSON.",
        blank=True,
    )
    min_level = models.IntegerField(default=1, choices=DIFFICULTY_LEVELS)
    max_level = models.IntegerField(default=10, choices=DIFFICULTY_LEVELS)
    difficulty = models.IntegerField(default=4, choices=DIFFICULTY_LEVELS)
    estimated_time_minutes = models.IntegerField(default=10)
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='leads_to'
    )
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Analytics fields
    avg_completion_time = models.FloatField(default=0)
    success_rate = models.FloatField(default=0)
    popularity_score = models.FloatField(default=0)

    def __str__(self) -> str:
        return f"{self.title} (Level {self.min_level}-{self.max_level})"
    
    class Meta:
        ordering = ['order', 'created_at']


class LearningPath(models.Model):
    """Personalized learning path for each user"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default="My Learning Path")
    contents = models.ManyToManyField(
        LearningContent,
        through='LearningPathItem',
        related_name='learning_paths'
    )
    current_content = models.ForeignKey(
        LearningContent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_in_paths'
    )
    is_active = models.BooleanField(default=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self) -> str:
        return f"{self.user.username} - {self.name}"


class LearningPathItem(models.Model):
    """Individual item in a learning path"""
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    required = models.BooleanField(default=True)
    unlocked = models.BooleanField(default=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['learning_path', 'content']


class UserContentProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percent = models.FloatField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    interactions = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    rating = models.IntegerField(null=True, blank=True)  # 1-5 stars
    difficulty_feedback = models.IntegerField(
        null=True,
        blank=True,
        choices=LearningContent.DIFFICULTY_LEVELS
    )
    
    class Meta:
        unique_together = ("user", "content")
        verbose_name_plural = "User content progress"
    
    def __str__(self) -> str:
        return f"{self.user.username} - {self.content.title}: {self.progress_percent}%"


class LearningAnalytics(models.Model):
    """Detailed analytics for adaptive learning"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    event_type = models.CharField(max_length=50)  # view, complete, rate, test_result
    event_data = models.JSONField(default=dict)
    learning_path_id = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['event_type', 'timestamp']),
        ]


class ContentRecommendation(models.Model):
    """AI-powered content recommendations"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255)  # "similar_to_completed", "fills_gap", "popular"
    confidence_score = models.FloatField(default=0.5)
    priority = models.IntegerField(default=0)
    shown_at = models.DateTimeField(null=True, blank=True)
    clicked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-priority', '-confidence_score']


# ========== SIGNALS ==========

@receiver(post_save, sender=TestSession)
def update_content_recommendations(sender, instance, created, **kwargs):
    """
    When a user completes a test, update their learning recommendations
    """
    if instance.finished_at and instance.passed:
        from .services import update_recommendations_after_test
        update_recommendations_after_test(instance.user, instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_initial_learning_path(sender, instance, created, **kwargs):
    """
    Create initial learning path for new users
    """
    if created and hasattr(instance, 'cognitive_level'):
        from .services import create_initial_path_for_user
        create_initial_path_for_user(instance)
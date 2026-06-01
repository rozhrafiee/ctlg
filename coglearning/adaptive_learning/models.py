from django.db import models
from django.conf import settings

class LearningContent(models.Model):
    CONTENT_TYPES = (("text", "متنی"), ("video", "ویدئویی"))
    
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    body = models.TextField(blank=True, help_text="برای محتوای متنی")
    file = models.FileField(upload_to='contents/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)
    
    # بازه سطح ۱ تا ۱۰۰
    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=100)
    
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Lvl: {self.min_level}-{self.max_level})"

class LearningPath(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_paths")
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class LearningPathItem(models.Model):
    path = models.ForeignKey(LearningPath, related_name="items", on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    is_unlocked = models.BooleanField(default=False)

class UserContentProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progress")
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    progress_percent = models.FloatField(default=0)
    is_completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)

class ContentRecommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.ForeignKey(LearningContent, on_delete=models.CASCADE)
    recommendation_type = models.CharField(max_length=100)
    priority_weight = models.FloatField(default=1.0)
    is_clicked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
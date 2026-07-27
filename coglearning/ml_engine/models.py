from django.conf import settings
from django.db import models


class ChurnPrediction(models.Model):
    """نتیجه پیش‌بینی ریزش (churn) برای یک کاربر"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='churn_predictions',
    )
    probability = models.FloatField()
    confidence = models.FloatField()
    is_at_risk = models.BooleanField(default=False)
    features_snapshot = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        risk = 'at_risk' if self.is_at_risk else 'ok'
        return f"ChurnPrediction({self.user_id}, {risk}, p={self.probability:.2f})"


class RetentionNotification(models.Model):
    """اعلان انگیزشی نگه‌داشت برای کاربران در معرض ریزش"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='retention_notifications',
    )
    message = models.TextField()
    prediction = models.ForeignKey(
        ChurnPrediction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    is_dismissed = models.BooleanField(default=False)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"RetentionNotification({self.user_id}, dismissed={self.is_dismissed})"

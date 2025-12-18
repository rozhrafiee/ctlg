from django.conf import settings
from django.db import models


class Alert(models.Model):
    SEVERITY_CHOICES = (
        ("info", "Info"),
        ("warning", "Warning"),
        ("critical", "Critical"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default="info")

    def __str__(self) -> str:
        return f"{self.user} - {self.severity}"



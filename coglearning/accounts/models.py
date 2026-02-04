from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "شهروند"),
        ("teacher", "استاد"),
        ("admin", "مدیر سیستم"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    # سطح شناختی شهروند بین ۱ تا ۱۰۰
    cognitive_level = models.IntegerField(default=1, null=True, blank=True)
    has_taken_placement_test = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # اساتید و مدیران نیازی به سطح‌بندی ندارند
        if self.role != 'student':
            self.cognitive_level = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("citizen", "Citizen"),
        ("admin", "Admin"),
        ("expert", "Expert"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="citizen")
    cognitive_level = models.IntegerField(default=1)



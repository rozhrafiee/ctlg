from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "شهروند"),
        ("teacher", "مسئول شهری (مدرس)"),
        ("admin", "مدیر سیستم"),
    )

    SORT_ALGO_CHOICES = (
        ("bubble", "Bubble Sort"),
        ("merge", "Merge Sort"),
    )
    SEARCH_ALGO_CHOICES = (
        ("linear", "Linear Search"),
        ("binary", "Binary Search"),
    )
    SORT_FIELD_CHOICES = (
        ("title", "عنوان"),
        ("min_level", "حداقل سطح"),
        ("time_limit_minutes", "مدت آزمون"),
        ("created_at", "تاریخ ایجاد"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    # سطح شناختی شهروند بین ۱ تا ۱۰۰
    cognitive_level = models.IntegerField(default=1, null=True, blank=True)
    has_taken_placement_test = models.BooleanField(default=False)

    # ترجیحات الگوریتم کاتالوگ آزمون (silver_project → API)
    preferred_sort_algorithm = models.CharField(
        max_length=20,
        choices=SORT_ALGO_CHOICES,
        default="bubble",
        blank=True,
    )
    preferred_search_algorithm = models.CharField(
        max_length=20,
        choices=SEARCH_ALGO_CHOICES,
        default="linear",
        blank=True,
    )
    default_sort_field = models.CharField(
        max_length=30,
        choices=SORT_FIELD_CHOICES,
        default="title",
        blank=True,
    )

    def save(self, *args, **kwargs):
        # مسئولان شهری (مدرسان) و مدیران نیازی به سطح‌بندی ندارند
        if self.role != 'student':
            self.cognitive_level = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
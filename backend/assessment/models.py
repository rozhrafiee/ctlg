from django.conf import settings
from django.db import models


class CognitiveTest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    min_level = models.IntegerField(default=1)
    max_level = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    is_placement_test = models.BooleanField(default=False, help_text="آزمون تعیین سطح اولیه")

    def __str__(self) -> str:
        return self.title


class Question(models.Model):
    QUESTION_TYPES = (
        ("mcq", "Multiple Choice"),
        ("text", "Text"),
    )

    test = models.ForeignKey(
        CognitiveTest, related_name="questions", on_delete=models.CASCADE
    )
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default="mcq")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.test.title} - {self.text[:50]}"


class Choice(models.Model):
    question = models.ForeignKey(
        Question, related_name="choices", on_delete=models.CASCADE
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    score = models.FloatField(default=0)

    def __str__(self) -> str:
        return self.text


class TestSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test = models.ForeignKey(CognitiveTest, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    total_score = models.FloatField(default=0)
    resulting_level = models.IntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.user} - {self.test} ({self.started_at})"


class Answer(models.Model):
    session = models.ForeignKey(
        TestSession, related_name="answers", on_delete=models.CASCADE
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(
        Choice, null=True, blank=True, on_delete=models.SET_NULL
    )
    text_answer = models.TextField(blank=True, null=True)
    score = models.FloatField(default=0)



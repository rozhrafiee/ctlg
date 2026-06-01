from django.db import models
from django.conf import settings

class CognitiveTest(models.Model):
    TEST_TYPES = (
        ('placement', 'تعیین سطح اولیه'),
        ('content_based', 'مرتبط با محتوا'),
        ('general', 'عمومی و آزاد'),
    )

    title = models.CharField(max_length=255)
    test_type = models.CharField(max_length=20, choices=TEST_TYPES, default='general')
    description = models.TextField(blank=True)

    # سازنده آزمون (برای آزمون‌های غیر محتوایی)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tests'
    )
    
    # بازه سطح ۱ تا ۱۰۰
    min_level = models.IntegerField(default=1, help_text="حداقل سطح لازم برای شرکت")
    target_level = models.IntegerField(default=1, help_text="سطح هدف این آزمون")
    
    # ارتباط با محتوا (اختیاری برای نوع content_based)
    related_content = models.OneToOneField(
        'adaptive_learning.LearningContent', 
        on_delete=models.CASCADE, 
        null=True, blank=True, 
        related_name='test'
    )
    
    time_limit_minutes = models.IntegerField(default=30)
    passing_score = models.IntegerField(default=70) # نمره قبولی از ۱۰۰
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_tests'
    )
    def __str__(self):
        return f"{self.title} ({self.get_test_type_display()})"

class Question(models.Model):
    CATEGORIES = (('memory', 'حافظه'), ('focus', 'تمرکز'), ('logic', 'منطق'))
    TYPES = (('mcq', 'تستی'), ('text', 'تشریحی'))

    test = models.ForeignKey(CognitiveTest, related_name="questions", on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='logic')
    question_type = models.CharField(max_length=10, choices=TYPES, default='mcq')
    text = models.TextField()
    correct_text_answer = models.TextField(blank=True, null=True, help_text="پاسخ صحیح برای سوالات تشریحی")
    points = models.IntegerField(default=10)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order','id']
        constraints = [
            models.UniqueConstraint(
                fields=['test', 'order'], 
                name='unique_question_order_per_test'
            )
        ]


class Choice(models.Model):
    question = models.ForeignKey(Question, related_name="choices", on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

class TestSession(models.Model):
    STATUS = (
        ('in_progress', 'در حال انجام'),
        ('completed', 'پایان یافته'),
        ('pending_review', 'در انتظار تصحیح مسئول شهری (مدرس)'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test = models.ForeignKey(CognitiveTest, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    total_score = models.FloatField(default=0) # نمره نهایی (۰-۱۰۰)
    teacher_feedback = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name="reviewed_tests"
    )

class Answer(models.Model):
    session = models.ForeignKey(TestSession, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, null=True, blank=True, on_delete=models.SET_NULL)
    text_answer = models.TextField(blank=True, null=True)
    score_earned = models.FloatField(default=0)
    is_reviewed = models.BooleanField(default=False)
    time_spent_seconds = models.IntegerField(default=0)


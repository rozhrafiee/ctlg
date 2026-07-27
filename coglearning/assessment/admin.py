from django.contrib import admin
from .models import CognitiveTest, Question, Choice, TestSession, Answer


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 0


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    show_change_link = True


@admin.register(CognitiveTest)
class CognitiveTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'test_type', 'created_by', 'is_active', 'created_at')
    list_filter = ('test_type', 'is_active')
    search_fields = ('title',)
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'test', 'category', 'question_type', 'points', 'order')
    list_filter = ('category', 'question_type')
    inlines = [ChoiceInline]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct', 'order')


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ('question', 'selected_choice', 'text_answer', 'score_earned', 'is_reviewed')


@admin.register(TestSession)
class TestSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'test', 'status', 'total_score', 'started_at', 'finished_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'test__title')
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'question', 'score_earned', 'is_reviewed')

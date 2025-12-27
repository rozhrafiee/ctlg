from rest_framework import serializers
from .models import CognitiveTest, Question, Choice, TestSession, Answer, ContentTestProgress
from adaptive_learning.models import LearningContent


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "order", "choices", "points", "explanation"]


class LearningContentSimpleSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای محتوا"""
    class Meta:
        model = LearningContent
        fields = ['id', 'title', 'content_type', 'min_level', 'max_level']


class CognitiveTestListSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    sessions_count = serializers.SerializerMethodField()
    related_content_info = serializers.SerializerMethodField()
    
    class Meta:
        model = CognitiveTest
        fields = ["id", "title", "description", "min_level", "max_level", 
                 "is_active", "is_placement_test", "total_questions",
                 "passing_score", "time_limit_minutes", "related_content",
                 "created_at", "updated_at", "questions_count", "sessions_count", "related_content_info"]
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_sessions_count(self, obj):
        return obj.testsession_set.count()
    
    def get_related_content_info(self, obj):
        if obj.related_content:
            return {
                'id': obj.related_content.id,
                'title': obj.related_content.title,
                'content_type': obj.related_content.content_type
            }
        return None


class CognitiveTestDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()
    related_content_info = serializers.SerializerMethodField()
    
    class Meta:
        model = CognitiveTest
        fields = [
            "id",
            "title",
            "description",
            "min_level",
            "max_level",
            "is_active",
            "is_placement_test",
            "total_questions",
            "passing_score",
            "time_limit_minutes",
            "related_content",
            "related_content_info",
            "created_at",
            "updated_at",
            "questions",
            "questions_count",
        ]
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_related_content_info(self, obj):
        if obj.related_content:
            return {
                'id': obj.related_content.id,
                'title': obj.related_content.title,
                'content_type': obj.related_content.content_type
            }
        return None


class TestSessionSerializer(serializers.ModelSerializer):
    test = CognitiveTestListSerializer(read_only=True)
    answers_count = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = TestSession
        fields = [
            "id",
            "test",
            "status",
            "started_at",
            "finished_at",
            "expires_at",
            "total_score",
            "points_earned",
            "total_points",
            "percentage",
            "passed",
            "resulting_level",
            "correct_answers",
            "wrong_answers",
            "time_spent_seconds",
            "time_spent_minutes",
            "answers_count",
            "time_remaining",
            "duration",
        ]
    
    def get_answers_count(self, obj):
        return obj.answers.count()
    
    def get_time_remaining(self, obj):
        if obj.expires_at and obj.status == 'in_progress':
            from django.utils import timezone
            remaining = obj.expires_at - timezone.now()
            if remaining.total_seconds() > 0:
                return int(remaining.total_seconds() // 60)
        return None
    
    def get_duration(self, obj):
        if obj.finished_at and obj.started_at:
            delta = obj.finished_at - obj.started_at
            minutes = int(delta.total_seconds() / 60)
            seconds = int(delta.total_seconds() % 60)
            return f"{minutes} دقیقه و {seconds} ثانیه"
        return "در حال انجام"
    
    def get_percentage(self, obj):
        return obj.percentage


class AnswerInputSerializer(serializers.Serializer):
    question = serializers.IntegerField()
    selected_choice = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    time_spent_seconds = serializers.IntegerField(default=0, min_value=0)


class SubmitSessionSerializer(serializers.Serializer):
    answers = AnswerInputSerializer(many=True)


class ChoiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["text", "is_correct", "order"]
    
    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("متن گزینه نمی‌تواند خالی باشد.")
        return value


class QuestionCreateSerializer(serializers.ModelSerializer):
    choices = ChoiceCreateSerializer(many=True, required=False, allow_empty=True)

    class Meta:
        model = Question
        fields = ["text", "question_type", "order", "points", "choices", "explanation"]
    
    def validate(self, data):
        question_type = data.get("question_type", "mcq")
        choices = data.get("choices", [])
        
        if question_type == "mcq" and len(choices) < 2:
            raise serializers.ValidationError({
                "choices": "برای سوالات چندگزینه‌ای حداقل 2 گزینه با متن لازم است."
            })
        
        return data

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", [])
        question = Question.objects.create(**validated_data)
        
        if question.question_type == "mcq" and choices_data:
            for i, choice_data in enumerate(choices_data):
                if 'order' not in choice_data:
                    choice_data['order'] = i
                Choice.objects.create(question=question, **choice_data)
        
        return question


class CognitiveTestCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, required=False)
    related_content = serializers.PrimaryKeyRelatedField(
        queryset=LearningContent.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = CognitiveTest
        fields = ["title", "description", "min_level", "max_level", 
                 "is_active", "is_placement_test", "total_questions",
                 "passing_score", "time_limit_minutes", "related_content", 
                 "questions"]
        extra_kwargs = {
            "is_placement_test": {"default": False, "required": False},
            "total_questions": {"default": 10},
            "passing_score": {"default": 70},
            "time_limit_minutes": {"default": 60},
        }


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    selected_choice_text = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'question_type',
                 'selected_choice', 'selected_choice_text', 
                 'text_answer', 'score', 
                 'answered_at', 'time_spent_seconds']
    
    def get_selected_choice_text(self, obj):
        return obj.selected_choice.text if obj.selected_choice else None


class TestResultSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    test = serializers.CharField(source='test.title', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = TestSession
        fields = ['id', 'user', 'test', 'status', 'started_at', 'finished_at', 
                 'total_score', 'percentage', 'passed', 'resulting_level', 
                 'correct_answers', 'wrong_answers', 
                 'time_spent_seconds', 'time_spent_minutes', 'answers']
    
    def get_percentage(self, obj):
        return obj.percentage
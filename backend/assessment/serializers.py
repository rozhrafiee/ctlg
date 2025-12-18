from rest_framework import serializers

from .models import CognitiveTest, Question, Choice, TestSession, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "order", "choices"]


class CognitiveTestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CognitiveTest
        fields = ["id", "title", "description", "min_level", "max_level", "is_active"]


class CognitiveTestDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = CognitiveTest
        fields = [
            "id",
            "title",
            "description",
            "min_level",
            "max_level",
            "is_active",
            "questions",
        ]


class TestSessionSerializer(serializers.ModelSerializer):
    test = CognitiveTestListSerializer(read_only=True)

    class Meta:
        model = TestSession
        fields = [
            "id",
            "test",
            "started_at",
            "finished_at",
            "total_score",
            "resulting_level",
        ]


class AnswerInputSerializer(serializers.Serializer):
    question = serializers.IntegerField()
    selected_choice = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)


class SubmitSessionSerializer(serializers.Serializer):
    answers = AnswerInputSerializer(many=True)



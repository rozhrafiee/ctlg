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
        fields = ["id", "title", "description", "min_level", "max_level", "is_active", "is_placement_test"]


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
            "is_placement_test",
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


class ChoiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["text", "is_correct", "score"]


class QuestionCreateSerializer(serializers.ModelSerializer):
    choices = ChoiceCreateSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ["text", "question_type", "order", "choices"]

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", [])
        question_type = validated_data.get("question_type", "mcq")
        question = Question.objects.create(**validated_data)
        # فقط برای سوالات چندگزینه‌ای گزینه اضافه می‌کنیم
        if question_type == "mcq" and choices_data:
            for choice_data in choices_data:
                Choice.objects.create(question=question, **choice_data)
        return question


class CognitiveTestCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, required=False)

    class Meta:
        model = CognitiveTest
        fields = ["title", "description", "min_level", "max_level", "is_active", "is_placement_test", "questions"]
        extra_kwargs = {
            "is_placement_test": {"default": False, "required": False},
        }

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        test = CognitiveTest.objects.create(**validated_data)
        
        for question_data in questions_data:
            # استخراج choices قبل از ایجاد سوال
            choices_data = question_data.pop("choices", [])
            question_type = question_data.get("question_type", "mcq")
            # ایجاد سوال با test
            question = Question.objects.create(test=test, **question_data)
            # فقط برای سوالات چندگزینه‌ای گزینه اضافه می‌کنیم
            if question_type == "mcq" and choices_data:
                for choice_data in choices_data:
                    Choice.objects.create(question=question, **choice_data)
        
        return test



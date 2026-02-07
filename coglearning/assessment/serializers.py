from rest_framework import serializers
from .models import CognitiveTest, Question, Choice, TestSession, Answer

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'category', 'question_type', 'text', 'choices', 'points', 'order']

class QuestionCreateSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['category', 'question_type', 'text', 'points', 'order', 'choices']

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        test = self.context.get('test')
        # اعتبارسنجی ترتیب سوال در سطح کد
        order = validated_data.get('order')
        if Question.objects.filter(test=test, order=order).exists():
            raise serializers.ValidationError({"order": f"ترتیب {order} تکراری است."})
            
        question = Question.objects.create(test=test, **validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question

class CognitiveTestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    class Meta:
        model = CognitiveTest
        fields = '__all__'
        read_only_fields = ['created_by']

class CognitiveTestCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, write_only=True)

    class Meta:
        model = CognitiveTest
        fields = ['id', 'title', 'description', 'time_limit_minutes', 'target_level', 'min_level', 'test_type', 'questions', 'related_content']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        user = self.context['request'].user
        test = CognitiveTest.objects.create(created_by=user, **validated_data)
        
        for q_data in questions_data:
            q_serializer = QuestionCreateSerializer(data=q_data, context={'test': test})
            q_serializer.is_valid(raise_exception=True)
            q_serializer.save()
        return test

class QuestionUpdateSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)
    class Meta:
        model = Question
        fields = ['category', 'question_type', 'text', 'points', 'order', 'choices']

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if choices_data is not None:
            instance.choices.all().delete()
            for c_data in choices_data:
                Choice.objects.create(question=instance, **c_data)
        return instance

class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    class Meta:
        model = Answer
        fields = '__all__'

class TestSessionSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    class Meta:
        model = TestSession
        fields = '__all__'

class TestResultDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True, source='answers.all')
    class Meta:
        model = TestSession
        fields = ['id', 'test_title', 'status', 'total_score', 'started_at', 'finished_at', 'teacher_feedback', 'answers']

class TestResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    class Meta:
        model = TestSession
        fields = '__all__'
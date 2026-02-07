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

# =========================================================
# === کلاس اصلاح شده: QuestionCreateSerializer ===
# =========================================================
class QuestionCreateSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['category', 'question_type', 'text', 'points', 'order', 'choices']

    def validate(self, attrs):
        # این قسمت اعتبارسنجی فقط برای گزینه‌های تودرتو است که نیازی به 'test' والد ندارد.
        choices_data = attrs.get('choices', [])
        if choices_data:
            orders = [c.get('order') for c in choices_data if c.get('order') is not None]
            if len(orders) != len(set(orders)):
                raise serializers.ValidationError({
                    "choices": "ترتیب (order) گزینه‌ها در یک سوال نمی‌تواند تکراری باشد."
                })
        
        return attrs

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        # 'test' از کانتکست CognitiveTestCreateSerializer دریافت می‌شود.
        test = self.context.get('test') 
        
        # اعتبارسنجی تکرار 'order' در سطح سوالات، حالا که 'test' در دسترس است
        order = validated_data.get('order')
        if Question.objects.filter(test=test, order=order).exists():
             # این خطا برای اطمینان از صحت داده‌ها در زمان create است.
             raise serializers.ValidationError({
                 "order": f"سوال با ترتیب {order} قبلاً در این آزمون ثبت شده است."
             })
             
        # ایجاد سوال با اختصاص 'test'
        question = Question.objects.create(test=test, **validated_data)
        
        # ایجاد گزینه‌ها
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
            
        return question

class CognitiveTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CognitiveTest
        fields = '__all__'

# =========================================================
# === کلاس اصلاح شده: CognitiveTestCreateSerializer ===
# =========================================================
class CognitiveTestCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, write_only=True) 

    class Meta:
        model = CognitiveTest
        # اگر در مدل شما نام فیلد تعیین سطح 'min_level' است، آن را به 'min_level' برگردانید.
        fields = ['id', 'title', 'description', 'time_limit_minutes', 'target_level', 'test_type', 'questions'] 

    def create(self, validated_data):
        # ۱. جدا کردن داده‌های سوالات
        questions_data = validated_data.pop('questions', [])
        
        # ۲. ساخت خودِ شیء آزمون (CognitiveTest)
        test = CognitiveTest.objects.create(**validated_data)
        
        # ۳. ساخت سوالات
        for q_data in questions_data:
            # ایجاد یک نمونه از سریالایزر سوال، داده‌ها را ارسال کرده و 'test' را به کانتکست می‌دهیم.
            q_serializer = QuestionCreateSerializer(data=q_data, context={'test': test})
            
            # اعتبارسنجی را اجرا می‌کنیم. (اینجا دیگر خطای کانتکست رخ نمی‌دهد)
            q_serializer.is_valid(raise_exception=True)
            
            # ذخیره سوال و گزینه‌های آن
            q_serializer.save() 
            
        return test

# backend/assessment/serializers.py

class QuestionUpdateSerializer(serializers.ModelSerializer):
    # فیلد گزینه‌ها برای ویرایش تو در تو
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['category', 'question_type', 'text', 'points', 'order', 'choices']

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', None)
        
        # ۱. بروزرسانی فیلدهای اصلی سوال
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ۲. بروزرسانی گزینه‌ها (در صورت ارسال در JSON)
        if choices_data is not None:
            # حذف گزینه‌های قدیمی و ثبت گزینه‌های جدید
            instance.choices.all().delete()
            for choice_data in choices_data:
                Choice.objects.create(question=instance, **choice_data)
        
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

class UserAnswerResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_text_answer', read_only=True)
    category = serializers.CharField(source='question.category', read_only=True)

    class Meta:
        model = Answer
        fields = ['question_text', 'category', 'selected_choice', 'text_answer', 'correct_answer', 'score_earned']

class TestResultDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    answers = UserAnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = TestSession
        fields = ['id', 'test_title', 'status', 'total_score', 'started_at', 'finished_at', 'teacher_feedback', 'answers']

class UserAnswerDetailSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    category = serializers.CharField(source='question.category', read_only=True)
    correct_choice_text = serializers.SerializerMethodField()
    user_choice_text = serializers.CharField(source='selected_choice.text', read_only=True)
    sample_correct_text = serializers.CharField(source='question.correct_text_answer', read_only=True)

    class Meta:
        model = Answer
        fields = ['question_text', 'question_type', 'category', 'user_choice_text', 'text_answer', 'correct_choice_text', 'sample_correct_text', 'score_earned', 'is_reviewed']

    def get_correct_choice_text(self, obj):
        if obj.question.question_type == 'mcq':
            correct_choice = obj.question.choices.filter(is_correct=True).first()
            return correct_choice.text if correct_choice else None
        return None

class TestResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    test_type = serializers.CharField(source='test.test_type', read_only=True)
    answers = UserAnswerDetailSerializer(many=True, read_only=True)

    class Meta:
        model = TestSession
        fields = ['id', 'test_title', 'test_type', 'status', 'total_score', 'started_at', 'finished_at', 'teacher_feedback', 'answers']

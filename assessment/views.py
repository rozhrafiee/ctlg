from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import CognitiveTest, Question, Choice, TestSession, Answer
from .serializers import *
from .services import AssessmentService
from accounts.permissions import IsTeacher

# --- Teacher: Test Management ---
class TeacherTestListView(generics.ListAPIView):
    serializer_class = CognitiveTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = CognitiveTest.objects.all().order_by("-id")

class CognitiveTestCreateView(generics.CreateAPIView):
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def create_placement_test(request):
    data = request.data.copy()
    data["test_type"] = "placement"
    serializer = CognitiveTestCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def create_test_for_content(request, content_id):
    from adaptive_learning.models import LearningContent
    user = request.user
    
    content = get_object_or_404(LearningContent, id=content_id)
    
    # تحقق: استاد فقط می‌تواند آزمون برای محتوای خودش بسازد
    if user.role != 'admin' and content.author != user:
        return Response(
            {"error": "شما اجازه ندارید آزمون برای این محتوا بسازید"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    test, created = CognitiveTest.objects.get_or_create(
        related_content=content,
        defaults={"title": f"آزمون: {content.title}", "test_type": "content_based", "min_level": content.min_level}
    )
    return Response({"test": CognitiveTestSerializer(test).data, "created": created})

# --- Teacher: Question Management ---
@api_view(["GET"])
def list_questions_for_test(request, test_id):
    questions = Question.objects.filter(test_id=test_id)
    return Response(QuestionSerializer(questions, many=True).data)

# backend/assessment/views.py

class QuestionUpdateView(generics.RetrieveUpdateAPIView):
    """مشاهده و ویرایش سوال - حذف توسط این ویو انجام نمی‌شود"""
    serializer_class = QuestionUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Question.objects.all()
        # محدود کردن دسترسی به سوالات خودِ استاد (محتوای آن‌ها)
        return Question.objects.filter(test__related_content__author=user)
    
from django.db import transaction 

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def add_question_to_test(request, test_id):
    user = request.user
    test = get_object_or_404(CognitiveTest, id=test_id)
    
    # تحقق: استاد فقط می‌تواند سوال به تست‌های محتوای خودش اضافه کند
    if user.role != 'admin' and (not test.related_content or test.related_content.author != user):
        return Response(
            {"error": "شما اجازه ندارید سوال به این آزمون اضافه کنید"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = QuestionCreateSerializer(
        data=request.data, 
        context={'test': test}
    )
    
    serializer.is_valid(raise_exception=True)

    with transaction.atomic():
        question = serializer.save()
    return Response(
        QuestionSerializer(question).data, 
        status=status.HTTP_201_CREATED
    )

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def delete_question(request, question_id):
    user = request.user
    question = get_object_or_404(Question, id=question_id)
    
    # تحقق: استاد فقط می‌تواند سوالات تست‌های محتوای خودش را حذف کند
    if user.role != 'admin':
        test = question.test
        if not test.related_content or test.related_content.author != user:
            return Response(
                {"error": "شما اجازه ندارید این سوال را حذف کنید"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    question.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# --- Student: Flow ---
@api_view(["POST"])
def start_test_session(request, test_id):
    test = get_object_or_404(CognitiveTest, id=test_id, is_active=True)
    expires = timezone.now() + timezone.timedelta(minutes=test.time_limit_minutes)
    session, _ = TestSession.objects.get_or_create(user=request.user, test=test, status='in_progress', defaults={'expires_at': expires})
    return Response(TestSessionSerializer(session).data)

@api_view(["POST"])
def submit_answer(request, session_id, question_id):
    session = get_object_or_404(TestSession, id=session_id, user=request.user)
    Answer.objects.update_or_create(session=session, question_id=question_id, defaults={
        'selected_choice_id': request.data.get('selected_choice'),
        'text_answer': request.data.get('text_answer'),
        'time_spent_seconds': request.data.get('time_spent_seconds', 0)
    })
    return Response({"status": "saved"})

@api_view(["POST"])
def finish_test_session(request, session_id):
    session = get_object_or_404(TestSession, id=session_id, user=request.user)
    AssessmentService.process_test_completion(session)
    return Response({"status": session.status, "score": session.total_score})


class StudentTestListView(generics.ListAPIView):
    serializer_class = CognitiveTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # ۱. مدیریت مقدار None برای سطح (اگر استاد بود یا به هر دلیلی None بود)
        # اگر سطح None بود، مقدار ۱ را در نظر می‌گیرد
        user_level = user.cognitive_level if user.cognitive_level is not None else 1

        # ۲. اگر کاربر استاد یا ادمین است، همه آزمون‌های فعال را ببیند
        if user.role != 'student':
            return CognitiveTest.objects.filter(is_active=True)

        # ۳. اگر کاربر هنوز تعیین سطح نشده، فقط آزمون تعیین سطح را ببیند
        if not user.has_taken_placement_test:
            return CognitiveTest.objects.filter(is_active=True, test_type='placement')

        # ۴. برای شهروند تعیین سطح شده: آزمون‌های متناسب با سطح (LTE: کمتر یا مساوی)
        return CognitiveTest.objects.filter(
            is_active=True, 
            min_level__lte=user_level
        ).order_by('min_level')
    
# --- Teacher: Review ---
class PendingReviewsListView(generics.ListAPIView):
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = TestSession.objects.filter(status='pending_review')

@api_view(["GET"])
def get_session_details(request, session_id):
    session = get_object_or_404(TestSession, id=session_id)
    return Response({"session": TestSessionSerializer(session).data, "answers": AnswerSerializer(session.answers.all(), many=True).data})

@api_view(["POST"])
def submit_manual_grade(request, session_id):
    session = get_object_or_404(TestSession, id=session_id, status='pending_review')
    with transaction.atomic():
        for g in request.data.get("grades", []):
            ans = Answer.objects.get(id=g['answer_id'], session=session)
            ans.score_earned = g['score']
            ans.save()
        earned = sum(a.score_earned for a in session.answers.all())
        total = sum(q.points for q in session.test.questions.all())
        session.total_score = (earned / total * 100) if total > 0 else 0
        session.status = 'completed'
        session.save()
        AssessmentService.apply_level_logic(session.user, session)
    return Response({"status": "graded", "score": session.total_score})

class UserTestResultDetailView(generics.RetrieveAPIView):
    """مشاهده کارنامه و جزئیات آزمون توسط شهروند"""
    serializer_class = TestResultDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # هر کاربر فقط کارنامه خودش را ببیند
        return TestSession.objects.filter(user=self.request.user)

class StudentHistoryListView(generics.ListAPIView):
    """لیست تمام آزمون‌هایی که کاربر تا الان داده است"""
    serializer_class = TestSessionSerializer # یا یک نسخه خلاصه شده
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user).order_by('-finished_at')


class StudentTestHistoryView(generics.ListAPIView):
    """لیست تمام آزمون‌هایی که شهروند شرکت کرده است"""
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # فقط آزمون‌های خودِ کاربر که تمام شده‌اند یا در انتظار تصحیح هستند
        return TestSession.objects.filter(
            user=self.request.user
        ).exclude(status='in_progress').order_by('-finished_at')

class StudentTestDetailView(generics.RetrieveAPIView):
    """مشاهده جزئیات کارنامه یک آزمون خاص"""
    serializer_class = TestResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user)    


class CognitiveTestUpdateView(generics.RetrieveUpdateAPIView):
    """ویرایش تنظیمات آزمون (زمان، نمره قبولی، سطح هدف)"""
    serializer_class = CognitiveTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = CognitiveTest.objects.all()

    def get_queryset(self):
        # اساتید فقط آزمون‌هایی را ببینند که خودشان ساخته‌اند (از طریق محتوای مرتبط)
        if self.request.user.role == 'admin':
            return CognitiveTest.objects.all()
        return CognitiveTest.objects.filter(related_content__author=self.request.user)

class CognitiveTestDeleteView(generics.DestroyAPIView):
    """حذف کامل آزمون"""
    serializer_class = CognitiveTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = CognitiveTest.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return CognitiveTest.objects.all()
        return CognitiveTest.objects.filter(related_content__author=self.request.user)    
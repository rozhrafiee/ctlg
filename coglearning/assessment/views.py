from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction, models
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
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CognitiveTest.objects.all().order_by("-id")
        return CognitiveTest.objects.filter(
            models.Q(created_by=user) | models.Q(related_content__author=user)
        ).distinct().order_by("-id")

class CognitiveTestCreateView(generics.CreateAPIView):
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def create_placement_test(request):
    data = request.data.copy()
    data["test_type"] = "placement"
    serializer = CognitiveTestCreateSerializer(data=data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class CognitiveTestUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = CognitiveTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CognitiveTest.objects.all()
        return CognitiveTest.objects.filter(
            models.Q(created_by=user) | models.Q(related_content__author=user)
        ).distinct()

class CognitiveTestDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CognitiveTest.objects.all()
        return CognitiveTest.objects.filter(
            models.Q(created_by=user) | models.Q(related_content__author=user)
        ).distinct()

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def create_test_for_content(request, content_id):
    from adaptive_learning.models import LearningContent
    content = get_object_or_404(LearningContent, id=content_id)
    if request.user.role != 'admin' and content.author != request.user:
        return Response({"error": "عدم دسترسی"}, status=403)
    test, created = CognitiveTest.objects.get_or_create(
        related_content=content,
        defaults={
            "title": f"آزمون: {content.title}",
            "test_type": "content_based",
            "created_by": request.user,
            "passing_score": 80,
        }
    )
    return Response({"test": CognitiveTestSerializer(test).data, "created": created})

# --- Teacher: Question Management ---
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def list_questions_for_test(request, test_id):
    user = request.user
    test = get_object_or_404(CognitiveTest, id=test_id)
    if user.role != 'admin':
        if test.related_content:
            if test.related_content.author != user:
                return Response({"error": "عدم دسترسی"}, status=403)
        elif test.created_by != user:
            return Response({"error": "عدم دسترسی"}, status=403)
    questions = Question.objects.filter(test=test)
    return Response(QuestionSerializer(questions, many=True).data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def add_question_to_test(request, test_id):
    user = request.user
    test = get_object_or_404(CognitiveTest, id=test_id)
    if user.role != 'admin':
        if test.related_content:
            if test.related_content.author != user:
                return Response({"error": "عدم دسترسی"}, status=403)
        elif test.created_by != user:
            return Response({"error": "عدم دسترسی"}, status=403)
    serializer = QuestionCreateSerializer(data=request.data, context={'test': test})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        question = serializer.save()
    return Response(QuestionSerializer(question).data, status=201)

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def delete_question(request, question_id):
    user = request.user
    question = get_object_or_404(Question, id=question_id)
    if user.role != 'admin':
        test = question.test
        if test.related_content:
            if test.related_content.author != user:
                return Response({"error": "عدم دسترسی"}, status=403)
        elif test.created_by != user:
            return Response({"error": "عدم دسترسی"}, status=403)
    question.delete()
    return Response(status=204)

class QuestionUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = QuestionUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    queryset = Question.objects.all()

# --- Student Flow ---
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def start_test_session(request, test_id):
    test = get_object_or_404(CognitiveTest, id=test_id, is_active=True)
    session = TestSession.objects.filter(user=request.user, test=test, status='in_progress').first()
    if not session:
        expires = timezone.now() + timezone.timedelta(minutes=test.time_limit_minutes)
        session = TestSession.objects.create(user=request.user, test=test, expires_at=expires)
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
        level = user.cognitive_level or 1
        if user.role != 'student': return CognitiveTest.objects.filter(is_active=True)
        if not user.has_taken_placement_test:
            return CognitiveTest.objects.filter(is_active=True, test_type='placement')
        return CognitiveTest.objects.filter(is_active=True, min_level__lte=level).exclude(test_type='placement')

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_test_detail(request, test_id):
    test = get_object_or_404(CognitiveTest, id=test_id, is_active=True)
    user = request.user
    if user.role == 'student':
        user_level = user.cognitive_level or 1
        if not user.has_taken_placement_test and test.test_type != 'placement':
            return Response({"error": "عدم دسترسی"}, status=403)
        if user.has_taken_placement_test and test.test_type == 'placement':
            return Response({"error": "عدم دسترسی"}, status=403)
        if test.test_type != 'placement' and test.min_level and user_level < test.min_level:
            return Response({"error": "عدم دسترسی"}, status=403)
    serializer = CognitiveTestDetailSerializer(test)
    return Response(serializer.data)

# --- Review & Results ---
class PendingReviewsListView(generics.ListAPIView):
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return TestSession.objects.filter(status='pending_review')
        return TestSession.objects.filter(
            status='pending_review'
        ).filter(
            models.Q(test__related_content__author=user) | models.Q(test__created_by=user)
        ).distinct()

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def get_session_details(request, session_id):
    user = request.user
    session = get_object_or_404(TestSession, id=session_id)
    if user.role != 'admin':
        test = session.test
        if test.related_content:
            if test.related_content.author != user:
                return Response({"error": "عدم دسترسی"}, status=403)
        elif test.created_by != user:
            return Response({"error": "عدم دسترسی"}, status=403)
    return Response({
        "session": TestSessionSerializer(session).data,
        "answers": AnswerSerializer(session.answers.all(), many=True).data
    })

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def submit_manual_grade(request, session_id):
    user = request.user
    session = get_object_or_404(TestSession, id=session_id, status='pending_review')
    if user.role != 'admin':
        test = session.test
        if test.related_content:
            if test.related_content.author != user:
                return Response({"error": "عدم دسترسی"}, status=403)
        elif test.created_by != user:
            return Response({"error": "عدم دسترسی"}, status=403)
    with transaction.atomic():
        grades = request.data.get("grades", [])
        for g in grades:
            Answer.objects.filter(id=g['answer_id'], session=session).update(score_earned=g['score'], is_reviewed=True)
        # محاسبه مجدد نمره کل
        total = sum(a.score_earned for a in session.answers.all())
        possible = sum(a.question.points for a in session.answers.all())
        session.total_score = (total/possible*100) if possible > 0 else 0
        session.status = 'completed'
        session.save()
        AssessmentService.apply_level_logic(session.user, session)
        AssessmentService.update_analytics_profile(session)
        AssessmentService.mark_content_completed_if_content_based(session)
    return Response({"status": "graded"})

class UserTestResultDetailView(generics.RetrieveAPIView):
    serializer_class = TestResultDetailSerializer
    queryset = TestSession.objects.all()

class StudentHistoryListView(generics.ListAPIView):
    serializer_class = TestSessionSerializer
    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user).exclude(status='in_progress')

class StudentTestDetailView(generics.RetrieveAPIView):
    serializer_class = TestResultDetailSerializer
    queryset = TestSession.objects.all()

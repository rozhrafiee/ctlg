from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from analytics.views import IsTeacherRole
from .models import CognitiveTest, TestSession, Question, Choice
from .serializers import (
    CognitiveTestListSerializer,
    CognitiveTestDetailSerializer,
    CognitiveTestCreateSerializer,
    TestSessionSerializer,
    SubmitSessionSerializer,
    QuestionCreateSerializer,
)
from .services import grade_session


class CognitiveTestListView(generics.ListAPIView):
    serializer_class = CognitiveTestListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_level = getattr(self.request.user, "cognitive_level", 1)
        return CognitiveTest.objects.filter(
            is_active=True, min_level__lte=user_level, max_level__gte=user_level
        )


class CognitiveTestDetailView(generics.RetrieveAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestSessionListView(generics.ListAPIView):
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user).order_by(
            "-started_at"
        )


class TestSessionDetailView(generics.RetrieveAPIView):
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def start_session(request, pk: int):
    test = generics.get_object_or_404(CognitiveTest, pk=pk, is_active=True)
    session = TestSession.objects.create(user=request.user, test=test)
    return Response(TestSessionSerializer(session).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_session(request, session_id: int):
    session = generics.get_object_or_404(
        TestSession, pk=session_id, user=request.user
    )
    serializer = SubmitSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    session = grade_session(session, serializer.validated_data["answers"])
    return Response(TestSessionSerializer(session).data)


class CognitiveTestCreateView(generics.CreateAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherRole]


class CognitiveTestUpdateView(generics.UpdateAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherRole]


@api_view(["POST"])
@permission_classes([IsTeacherRole])
def add_question_to_test(request, test_id: int):
    test = generics.get_object_or_404(CognitiveTest, pk=test_id)
    serializer = QuestionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    question = Question.objects.create(test=test, **serializer.validated_data)
    from .serializers import QuestionSerializer
    return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)



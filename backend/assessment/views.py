# assessment/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg, Max, Count
from django.shortcuts import get_object_or_404

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
        # فقط student می‌تواند آزمون ببیند
        if getattr(self.request.user, "role", "") != "student":
            return CognitiveTest.objects.none()
        
        user_level = getattr(self.request.user, "cognitive_level", 1)
        
        # آزمون‌های تعیین سطح را جدا می‌کنیم
        return CognitiveTest.objects.filter(
            is_active=True, 
            is_placement_test=False,
            min_level__lte=user_level, 
            max_level__gte=user_level
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
    # فقط student می‌تواند آزمون بدهد
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    test = get_object_or_404(CognitiveTest, pk=pk, is_active=True)
    
    # بررسی آیا قبلاً این آزمون تعیین سطح را داده
    if test.is_placement_test:
        if getattr(request.user, "has_taken_placement_test", False):
            return Response(
                {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    session = TestSession.objects.create(user=request.user, test=test)
    
    return Response({
        "session_id": session.id,
        "test_title": test.title,
        "started_at": session.started_at,
        "is_placement_test": test.is_placement_test,
        "message": "آزمون شروع شد."
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_session(request, session_id: int):
    # فقط student می‌تواند آزمون بدهد
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    session = get_object_or_404(TestSession, pk=session_id, user=request.user)
    
    # بررسی آیا قبلاً ارسال شده
    if session.finished_at is not None:
        return Response(
            {"detail": "این آزمون قبلاً تکمیل شده است."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = SubmitSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # تصحیح آزمون
    session = grade_session(session, serializer.validated_data["answers"])
    
    # بررسی آیا سطح افزایش یافته
    old_level = getattr(request.user, "cognitive_level", 1)
    new_level = getattr(request.user, "cognitive_level", 1)  # کاربر آپدیت شده
    
    return Response({
        "session": TestSessionSerializer(session).data,
        "level_increased": new_level > old_level,
        "old_level": old_level,
        "new_level": new_level,
        "message": "آزمون با موفقیت تصحیح شد." + 
                  (" تبریک! سطح شما افزایش یافت." if new_level > old_level else "")
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_placement_test(request):
    """دریافت آزمون تعیین سطح اولیه"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون تعیین سطح بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # بررسی آیا کاربر قبلاً آزمون تعیین سطح داده
    if getattr(request.user, "has_taken_placement_test", False):
        return Response(
            {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # پیدا کردن آزمون تعیین سطح
    placement_test = CognitiveTest.objects.filter(
        is_active=True, is_placement_test=True
    ).first()
    
    if not placement_test:
        return Response(
            {"detail": "آزمون تعیین سطح یافت نشد."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CognitiveTestDetailSerializer(placement_test)
    return Response({
        "test": serializer.data,
        "message": "آزمون تعیین سطح اولیه"
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_progress(request):
    """پیشرفت ساده کاربر"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان دارای پیشرفت هستند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user = request.user
    sessions = TestSession.objects.filter(
        user=user, 
        finished_at__isnull=False
    ).select_related('test')
    
    placement_session = sessions.filter(test__is_placement_test=True).first()
    regular_sessions = sessions.filter(test__is_placement_test=False)
    
    # محاسبه آمار
    total_sessions = regular_sessions.count()
    average_score = regular_sessions.aggregate(avg=Avg('total_score'))['avg'] or 0
    best_score = regular_sessions.aggregate(max=Max('total_score'))['max'] or 0
    
    return Response({
        "user": {
            "username": user.username,
            "current_level": getattr(user, "cognitive_level", 1),
            "has_placement_test": getattr(user, "has_taken_placement_test", False),
            "placement_score": placement_session.total_score if placement_session else None,
        },
        "stats": {
            "total_tests_taken": total_sessions,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "tests_with_level_up": sessions.filter(
                resulting_level__gt=getattr(user, "cognitive_level", 1) - 1
            ).count(),
        },
        "recent_tests": [
            {
                "test_title": s.test.title,
                "score": round(s.total_score, 1),
                "date": s.finished_at,
                "is_placement": s.test.is_placement_test,
            }
            for s in sessions.order_by('-finished_at')[:5]
        ]
    })


# ویوهای مدرسان (همان‌طور که بود)
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
    test = get_object_or_404(CognitiveTest, pk=test_id)
    serializer = QuestionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    question = Question.objects.create(test=test, **serializer.validated_data)
    
    from .serializers import QuestionSerializer
    return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)
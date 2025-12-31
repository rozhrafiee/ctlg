from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging

from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
    LearningAnalytics,
)
from .serializers import (
    LearningContentSerializer,
    LearningPathSerializer,
    UserContentProgressSerializer,
    ProgressUpdateSerializer,
    ContentRecommendationSerializer,
)
from .services import (
    AdaptiveLearningEngine,
    create_initial_learning_path,
)

logger = logging.getLogger(__name__)

# =====================================================
# STUDENT VIEWS
# =====================================================


class RecommendedContentView(generics.ListAPIView):
    """
    GET /api/adaptive-learning/recommended/
    Personalized recommended learning content
    """
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        engine = AdaptiveLearningEngine(self.request.user)
        return engine.get_recommended_content(limit=20)


class LearningPathView(generics.RetrieveAPIView):
    """
    GET /api/adaptive-learning/learning-path/
    Get or create active learning path
    """
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        path = LearningPath.objects.filter(
            user=self.request.user,
            is_active=True
        ).first()

        if not path:
            engine = AdaptiveLearningEngine(self.request.user)
            path = engine.create_learning_path()

        return path


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reset_learning_path(request):
    """
    POST /api/adaptive-learning/learning-path/reset/
    Reset and regenerate learning path
    """
    LearningPath.objects.filter(
        user=request.user,
        is_active=True
    ).update(is_active=False)

    engine = AdaptiveLearningEngine(request.user)
    new_path = engine.create_learning_path()

    return Response(
        LearningPathSerializer(new_path).data,
        status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def update_progress(request, content_id: int):
    """
    POST /api/adaptive-learning/content/<id>/progress/
    Update user progress on content
    """
    content = get_object_or_404(
        LearningContent,
        id=content_id,
        is_active=True
    )

    serializer = ProgressUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    progress, created = UserContentProgress.objects.get_or_create(
        user=request.user,
        content=content,
        defaults={
            "progress_percent": data["progress_percent"],
            "last_accessed": timezone.now(),
        }
    )

    if not created:
        progress.progress_percent = max(
            progress.progress_percent,
            data["progress_percent"]
        )
        progress.last_accessed = timezone.now()

    if data.get("completed") or progress.progress_percent >= 100:
        progress.progress_percent = 100
        progress.completed_at = timezone.now()

    progress.save()

    # analytics (safe)
    LearningAnalytics.objects.create(
        user=request.user,
        content=content,
        event_type="progress_update",
        event_data={
            "progress_percent": progress.progress_percent,
            "completed": bool(progress.completed_at),
        },
    )

    return Response(
        UserContentProgressSerializer(progress).data,
        status=status.HTTP_200_OK
    )


class UserProgressListView(generics.ListAPIView):
    """
    GET /api/adaptive-learning/progress/
    List user's learning progress
    """
    serializer_class = UserContentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserContentProgress.objects.filter(
            user=self.request.user
        ).select_related("content").order_by("-last_accessed")


class RecommendationsListView(generics.ListAPIView):
    """
    GET /api/adaptive-learning/recommendations/
    List AI recommendations
    """
    serializer_class = ContentRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContentRecommendation.objects.filter(
            user=self.request.user
        ).order_by("-priority")


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_recommendation_clicked(request, recommendation_id: int):
    """
    POST /api/adaptive-learning/recommendations/<id>/click/
    """
    rec = get_object_or_404(
        ContentRecommendation,
        id=recommendation_id,
        user=request.user
    )

    rec.clicked = True
    rec.save(update_fields=["clicked"])

    return Response({"status": "ok"})


# =====================================================
# CONTENT DETAILS
# =====================================================


class LearningContentDetailView(generics.RetrieveAPIView):
    """
    GET /api/adaptive-learning/content/<id>/
    """
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningContent.objects.filter(is_active=True)


# =====================================================
# DASHBOARD
# =====================================================


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def adaptive_dashboard(request):
    """
    GET /api/adaptive-learning/dashboard/
    Student adaptive dashboard
    """
    user = request.user

    total_content = LearningContent.objects.filter(is_active=True).count()
    completed = UserContentProgress.objects.filter(
        user=user,
        completed_at__isnull=False
    ).count()

    total_time = UserContentProgress.objects.filter(
        user=user
    ).aggregate(
        total=Sum("time_spent_seconds")
    )["total"] or 0

    path = LearningPath.objects.filter(
        user=user,
        is_active=True
    ).first()

    return Response({
        "current_level": getattr(user, "cognitive_level", 1),
        "learning_path": LearningPathSerializer(path).data if path else None,
        "stats": {
            "total_content": total_content,
            "completed": completed,
            "completion_rate": round(
                (completed / total_content) * 100, 1
            ) if total_content else 0,
            "total_hours": round(total_time / 3600, 2),
        }
    })


# =====================================================
# TEACHER / ADMIN VIEWS (SAFE BASE)
# =====================================================


class TeacherContentListView(generics.ListAPIView):
    """
    GET /api/adaptive-learning/teacher/contents/
    """
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", "") not in ("teacher", "admin"):
            return LearningContent.objects.none()
        return LearningContent.objects.all().order_by("-created_at")

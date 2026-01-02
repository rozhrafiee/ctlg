from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    LearningContent,
    LearningPath,
    UserContentProgress,
    ContentRecommendation,
)
from .serializers import (
    LearningContentSerializer,
    LearningPathSerializer,
    UserContentProgressSerializer,
    ProgressUpdateSerializer,
    ContentRecommendationSerializer,
)
from .permissions import IsTeacherOrAdmin
from .services import AdaptiveLearningEngine


# ===== Student =====

class RecommendedContentView(generics.ListAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        level = getattr(self.request.user, "cognitive_level", 1)
        return LearningContent.objects.filter(
            is_active=True,
            min_level__lte=level,
            max_level__gte=level,
        )


class LearningPathView(generics.RetrieveAPIView):
    serializer_class = LearningPathSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        path = LearningPath.objects.filter(
            user=self.request.user, is_active=True
        ).first()
        if not path:
            engine = AdaptiveLearningEngine(self.request.user)
            path = engine.create_learning_path()
        return path


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_learning_path(request):
    engine = AdaptiveLearningEngine(request.user)
    path = engine.create_learning_path()
    return Response(LearningPathSerializer(path).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_progress(request, content_id: int):
    content = get_object_or_404(LearningContent, id=content_id)
    serializer = ProgressUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    progress, _ = UserContentProgress.objects.get_or_create(
        user=request.user, content=content
    )

    progress.progress_percent = serializer.validated_data["progress_percent"]
    if serializer.validated_data.get("completed"):
        progress.completed_at = timezone.now()
    progress.save()

    return Response(UserContentProgressSerializer(progress).data)


class UserProgressListView(generics.ListAPIView):
    serializer_class = UserContentProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserContentProgress.objects.filter(user=self.request.user)


class RecommendationsListView(generics.ListAPIView):
    serializer_class = ContentRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ContentRecommendation.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_recommendation_clicked(request, recommendation_id: int):
    rec = get_object_or_404(
        ContentRecommendation, id=recommendation_id, user=request.user
    )
    rec.priority += 1
    rec.save()
    return Response({"status": "ok"})


class LearningContentDetailView(generics.RetrieveAPIView):
    queryset = LearningContent.objects.filter(is_active=True)
    serializer_class = LearningContentSerializer
    permission_classes = [IsAuthenticated]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def adaptive_dashboard(request):
    return Response({
        "level": getattr(request.user, "cognitive_level", 1),
    })


# ===== Teacher (CRUD Content) =====

class TeacherContentListView(generics.ListAPIView):
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]


class LearningContentCreateView(generics.CreateAPIView):
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]


class LearningContentUpdateView(generics.UpdateAPIView):
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]


class LearningContentDeleteView(generics.DestroyAPIView):
    queryset = LearningContent.objects.all()
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

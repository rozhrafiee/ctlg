from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from analytics.views import IsTeacherRole
from .models import LearningContent, LearningScenario, UserContentProgress
from .serializers import (
    LearningContentSerializer,
    LearningContentCreateSerializer,
    LearningScenarioSerializer,
    UserContentProgressSerializer,
    ProgressUpdateSerializer,
)


class RecommendedContentView(generics.ListAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_level = getattr(self.request.user, "cognitive_level", 1)
        return LearningContent.objects.filter(
            is_active=True, min_level__lte=user_level, max_level__gte=user_level
        )


class LearningContentDetailView(generics.RetrieveAPIView):
    queryset = LearningContent.objects.filter(is_active=True)
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated]


class LearningScenarioDetailView(generics.RetrieveAPIView):
    queryset = LearningScenario.objects.all()
    serializer_class = LearningScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserProgressListView(generics.ListAPIView):
    serializer_class = UserContentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserContentProgress.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def update_progress(request, content_id: int):
    content = generics.get_object_or_404(LearningContent, pk=content_id, is_active=True)
    serializer = ProgressUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    progress, _ = UserContentProgress.objects.get_or_create(
        user=request.user, content=content
    )
    progress.progress_percent = serializer.validated_data["progress_percent"]
    if serializer.validated_data.get("completed"):
        progress.completed_at = timezone.now()
        progress.progress_percent = 100.0
    progress.save()
    return Response(UserContentProgressSerializer(progress).data)


class LearningContentCreateView(generics.CreateAPIView):
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentCreateSerializer
    permission_classes = [IsTeacherRole]
    
    def perform_create(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": str(e)})


class LearningContentUpdateView(generics.UpdateAPIView):
    queryset = LearningContent.objects.all()
    serializer_class = LearningContentCreateSerializer
    permission_classes = [IsTeacherRole]



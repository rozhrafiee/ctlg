from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from .services import AdaptiveLearningEngine
from accounts.permissions import IsTeacher, HasTakenPlacementTest

# --- Student Views ---

class RecommendedContentView(generics.ListAPIView):
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, HasTakenPlacementTest]
    def get_queryset(self):
        AdaptiveLearningEngine.generate_recommendations(self.request.user)
        return ContentRecommendation.objects.filter(user=self.request.user)

class LearningPathView(generics.RetrieveAPIView):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated, HasTakenPlacementTest]
    def get_object(self):
        return LearningPath.objects.filter(user=self.request.user, is_active=True).first()

@api_view(["POST"])
def reset_learning_path(request):
    path = AdaptiveLearningEngine.create_or_refresh_path(request.user)
    return Response(LearningPathSerializer(path).data)

@api_view(["POST"])
def update_progress(request, content_id):
    progress, _ = UserContentProgress.objects.get_or_create(user=request.user, content_id=content_id)
    progress.progress_percent = request.data.get("percent", 100)
    if progress.progress_percent >= 100:
        progress.is_completed = True
    progress.save()
    return Response({"status": "updated"})

class UserProgressListView(generics.ListAPIView):
    serializer_class = UserContentProgressSerializer
    def get_queryset(self):
        return UserContentProgress.objects.filter(user=self.request.user)

class RecommendationsListView(generics.ListAPIView):
    serializer_class = RecommendationSerializer
    def get_queryset(self):
        return ContentRecommendation.objects.filter(user=self.request.user)

@api_view(["POST"])
def mark_recommendation_clicked(request, recommendation_id):
    rec = get_object_or_404(ContentRecommendation, id=recommendation_id, user=request.user)
    rec.is_clicked = True
    rec.save()
    return Response({"status": "marked"})

class LearningContentDetailView(generics.RetrieveAPIView):
    serializer_class = LearningContentSerializer
    queryset = LearningContent.objects.all()

@api_view(["GET"])
def adaptive_dashboard(request):
    user = request.user
    return Response({
        "level": user.cognitive_level,
        "completed_count": user.progress.filter(is_completed=True).count(),
        "active_path": LearningPath.objects.filter(user=user, is_active=True).exists()
    })

# --- Teacher CRUD Views ---

class TeacherContentListView(generics.ListCreateAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        # ادمین همه چیز را می‌بیند، استاد فقط مال خودش را
        if self.request.user.role == 'admin':
            return LearningContent.objects.all()
        return LearningContent.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LearningContentCreateView(generics.CreateAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LearningContentUpdateView(generics.UpdateAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        # ادمین می‌تواند هر چیزی را ویرایش کند، استاد فقط مال خودش را
        if self.request.user.role == 'admin':
            return LearningContent.objects.all()
        return LearningContent.objects.filter(author=self.request.user)

class LearningContentDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        # ادمین می‌تواند هر چیزی را حذف کند، استاد فقط مال خودش را
        if self.request.user.role == 'admin':
            return LearningContent.objects.all()
        return LearningContent.objects.filter(author=self.request.user)
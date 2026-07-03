from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from .services import AdaptiveLearningEngine
from accounts.permissions import IsTeacher, HasTakenPlacementTest
from assessment.models import CognitiveTest, TestSession

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
        path = LearningPath.objects.filter(user=self.request.user, is_active=True).first()
        # اگر مسیر نداریم، یکی بساز
        if not path:
            return AdaptiveLearningEngine.create_or_refresh_path(self.request.user)
        # اگر مسیر خالی است، همین را برگردان (ممکن است کاربر همه محتواهای موجود را دیده باشد)
        if not path.items.exists():
            return path

        # اگر آیتمی باید باز باشد ولی قفل ثبت شده (نسخه‌های قبلی)، مسیر را بازسازی کن
        level = self.request.user.cognitive_level or 1
        if path.items.filter(is_unlocked=False, content__min_level__lte=level).exists():
            return AdaptiveLearningEngine.create_or_refresh_path(self.request.user)

        # اگر کاربر یکی از آیتم‌های مسیر را دیده/شروع کرده، مسیر را تازه‌سازی کن تا آیتم‌های دیده‌شده نمایش داده نشوند
        content_ids = list(path.items.values_list("content_id", flat=True))
        if UserContentProgress.objects.filter(user=self.request.user, content_id__in=content_ids).exists():
            return AdaptiveLearningEngine.create_or_refresh_path(self.request.user)
        return path

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

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, HasTakenPlacementTest])
def learning_roadmap(request):
    """
    Roadmap of upcoming contents/tests for higher levels.
    Always computed from current user level + available content/tests.
    """
    user = request.user
    level = user.cognitive_level or 1
    try:
        limit = int(request.query_params.get("limit", 25))
    except Exception:
        limit = 25
    limit = max(1, min(limit, 100))

    # محتواهایی که کاربر هنوز تکمیل نکرده (می‌تواند شروع شده باشد)
    upcoming_contents = (
        LearningContent.objects.filter(is_active=True, min_level__gte=level)
        .exclude(usercontentprogress__user=user, usercontentprogress__is_completed=True)
        .order_by("min_level", "id")[:limit]
    )

    progress_map = {
        p.content_id: p
        for p in UserContentProgress.objects.filter(user=user, content_id__in=[c.id for c in upcoming_contents])
    }

    steps = []
    for c in upcoming_contents:
        p = progress_map.get(c.id)
        content_completed = bool(p.is_completed) if p else False
        progress_percent = float(p.progress_percent) if p else 0.0
        content_available = c.min_level <= level

        test = CognitiveTest.objects.filter(related_content=c, is_active=True).first()
        test_payload = None
        if test:
            test_completed = TestSession.objects.filter(user=user, test=test, status="completed").exists()
            test_available = test.min_level <= level
            test_payload = {
                "id": test.id,
                "title": test.title,
                "min_level": test.min_level,
                "target_level": test.target_level,
                "is_completed": test_completed,
                "is_available": test_available,
            }

        steps.append({
            "kind": "content",
            "id": c.id,
            "title": c.title,
            "content_type": c.content_type,
            "min_level": c.min_level,
            "max_level": c.max_level,
            "is_completed": content_completed,
            "progress_percent": progress_percent,
            "is_available": content_available,
            "related_test": test_payload,
        })

    return Response({
        "current_level": level,
        "limit": limit,
        "steps": steps,
    })

# --- Teacher CRUD Views ---

class TeacherContentListView(generics.ListCreateAPIView):
    serializer_class = LearningContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        # ادمین همه چیز را می‌بیند، مسئول شهری (مدرس) فقط مال خودش را
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
        # ادمین می‌تواند هر چیزی را ویرایش کند، مسئول شهری (مدرس) فقط مال خودش را
        if self.request.user.role == 'admin':
            return LearningContent.objects.all()
        return LearningContent.objects.filter(author=self.request.user)

class LearningContentDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        # ادمین می‌تواند هر چیزی را حذف کند، مسئول شهری (مدرس) فقط مال خودش را
        if self.request.user.role == 'admin':
            return LearningContent.objects.all()
        return LearningContent.objects.filter(author=self.request.user)
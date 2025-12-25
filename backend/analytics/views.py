from collections import Counter

from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.models import User
from assessment.models import TestSession
from adaptive_learning.models import UserContentProgress
from .models import Alert
from .serializers import AlertSerializer, AlertCreateSerializer, AlertUpdateSerializer


class IsAdminRole(permissions.BasePermission):
    """
    Allow access only to users with admin role (or staff/superuser).
    """

    def has_permission(self, request, view):
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return True
        return getattr(user, "role", "") == "admin"


class IsTeacherRole(permissions.BasePermission):
    """
    Allow access only to users with teacher role (or admin/staff/superuser).
    """

    def has_permission(self, request, view):
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return True
        role = getattr(user, "role", "")
        return role in ["teacher", "admin"]


@api_view(["GET"])
@permission_classes([IsAdminRole])
def overview(request):
    UserModel = get_user_model()
    total_users = UserModel.objects.count()
    level_counts = Counter(
        UserModel.objects.values_list("cognitive_level", flat=True)
    )

    total_sessions = TestSession.objects.count()
    avg_score = (
        TestSession.objects.filter(total_score__gt=0)
        .aggregate(avg_score_avg=models.Avg("total_score"))
        .get("avg_score_avg")
        or 0
    )

    completed_contents = UserContentProgress.objects.filter(
        completed_at__isnull=False
    ).count()

    data = {
        "total_users": total_users,
        "levels_distribution": level_counts,
        "total_test_sessions": total_sessions,
        "average_test_score": avg_score,
        "completed_contents": completed_contents,
    }
    return Response(data)


class AlertListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]
    queryset = Alert.objects.select_related("user").all().order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AlertCreateSerializer
        return AlertSerializer


class AlertUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAdminRole]
    queryset = Alert.objects.all()
    serializer_class = AlertUpdateSerializer


class MyAlertsListView(generics.ListAPIView):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user).select_related("user").order_by("-created_at")



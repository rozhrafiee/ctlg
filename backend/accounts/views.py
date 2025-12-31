from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from analytics.views import IsAdminRole
from .serializers import RegisterSerializer, UserSerializer


from rest_framework import generics, permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # 🔥 THIS LINE FIXES IT


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def needs_placement_test(request):
    """بررسی نیاز به آزمون تعیین سطح"""
    user = request.user
    if user.role != "student":
        return Response({"needs_placement_test": False})
    return Response({"needs_placement_test": not user.has_taken_placement_test})


TokenObtainPairView = TokenObtainPairView
TokenRefreshView = TokenRefreshView


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        from .models import User
        return User.objects.all()



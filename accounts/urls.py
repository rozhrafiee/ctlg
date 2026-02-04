from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView

urlpatterns = [
    # JWT Auth
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),#tested
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),#tested
    
    # User Management
    path('register/', RegisterView.as_view(), name='register'),#tested
    path('profile/', ProfileView.as_view(), name='profile'),#tested
]
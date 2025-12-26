# adaptive_learning/urls.py
from django.urls import path
from .views import (
    RecommendedContentView,
    LearningContentDetailView,
    LearningContentCreateView,
    LearningContentUpdateView,
    LearningContentDeleteView,
    LearningScenarioDetailView,
    UserProgressListView,
    update_progress,
    TeacherContentListView,
)

urlpatterns = [
    # برای دانشجو
    path("recommended/", RecommendedContentView.as_view(), name="learning-recommended"),
    path("content/<int:pk>/", LearningContentDetailView.as_view(), name="learning-detail"),
    path("content/<int:content_id>/progress/", update_progress, name="progress-update"),
    path("progress/", UserProgressListView.as_view(), name="progress-list"),
    path("scenarios/<int:pk>/", LearningScenarioDetailView.as_view(), name="scenario-detail"),
    
    # برای استاد (ایجاد و مدیریت محتوا)
    path("content/create/", LearningContentCreateView.as_view(), name="learning-create"),
    path("teacher/contents/", TeacherContentListView.as_view(), name="teacher-content-list"),
    path("content/<int:pk>/update/", LearningContentUpdateView.as_view(), name="learning-update"),
    path("content/<int:pk>/delete/", LearningContentDeleteView.as_view(), name="learning-delete"),
]
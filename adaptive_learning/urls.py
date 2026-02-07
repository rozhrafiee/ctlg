from django.urls import path
from .views import *

urlpatterns = [
    # Student
    path("recommended/", RecommendedContentView.as_view()),
    path("learning-path/", LearningPathView.as_view()),
    path("learning-path/reset/", reset_learning_path),
    path("content/<int:content_id>/progress/", update_progress),
    path("progress/", UserProgressListView.as_view()),
    path("recommendations/", RecommendationsListView.as_view()),
    path("recommendations/<int:recommendation_id>/click/", mark_recommendation_clicked),
    path("content/<int:pk>/", LearningContentDetailView.as_view()),
    path("dashboard/", adaptive_dashboard),

    # Teacher CRUD Content
    path("teacher/contents/", TeacherContentListView.as_view()),#tested
    path("teacher/content/create/", LearningContentCreateView.as_view()),#tested
    path("teacher/content/<int:pk>/update/", LearningContentUpdateView.as_view()),#tested
    path("teacher/content/<int:pk>/delete/", LearningContentDeleteView.as_view()),#tested
]
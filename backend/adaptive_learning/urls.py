from django.urls import path

from .views import (
    # student content & learning
    RecommendedContentView,
    LearningPathView,
    reset_learning_path,
    update_progress,
    UserProgressListView,
    RecommendationsListView,
    mark_recommendation_clicked,
    LearningContentDetailView,
    adaptive_dashboard,

    # teacher
    TeacherContentListView,
)

urlpatterns = [
    # =====================================================
    # STUDENT ENDPOINTS
    # =====================================================

    # dashboard
    path(
        "dashboard/",
        adaptive_dashboard,
        name="adaptive-dashboard"
    ),

    # recommended content
    path(
        "recommended/",
        RecommendedContentView.as_view(),
        name="recommended-content"
    ),

    # learning path
    path(
        "learning-path/",
        LearningPathView.as_view(),
        name="learning-path"
    ),
    path(
        "learning-path/reset/",
        reset_learning_path,
        name="learning-path-reset"
    ),

    # content
    path(
        "content/<int:pk>/",
        LearningContentDetailView.as_view(),
        name="content-detail"
    ),
    path(
        "content/<int:content_id>/progress/",
        update_progress,
        name="content-progress"
    ),

    # progress & recommendations
    path(
        "progress/",
        UserProgressListView.as_view(),
        name="user-progress"
    ),
    path(
        "recommendations/",
        RecommendationsListView.as_view(),
        name="recommendations"
    ),
    path(
        "recommendations/<int:recommendation_id>/click/",
        mark_recommendation_clicked,
        name="recommendation-click"
    ),

    # =====================================================
    # TEACHER / ADMIN
    # =====================================================

    path(
        "teacher/contents/",
        TeacherContentListView.as_view(),
        name="teacher-contents"
    ),
]


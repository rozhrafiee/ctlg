from django.urls import path
from .views import (
    # Student views
    AdaptiveLearningDashboardView,
    RecommendedContentView,
    LearningContentDetailView,
    LearningPathView,
    LearningPathUpdateView,
    UserProgressListView,
    RecommendationsListView,
    
    # Student API endpoints
    update_progress,
    mark_recommendation_clicked,
    reset_learning_path,
    
    # Teacher views
    TeacherContentListView,
    LearningContentCreateView,
    LearningContentUpdateView,
    LearningContentDeleteView,
    TeacherAnalyticsView,
    get_content_analytics,
)

urlpatterns = [
    # ========== STUDENT ENDPOINTS ==========
    # Dashboard and overview
    path("dashboard/", AdaptiveLearningDashboardView.as_view(), name="adaptive-dashboard"),
    path("recommended/", RecommendedContentView.as_view(), name="adaptive-recommended"),
    path("recommendations/", RecommendationsListView.as_view(), name="recommendations-list"),
    path("recommendations/<int:recommendation_id>/click/", mark_recommendation_clicked, name="mark-recommendation-clicked"),
    
    # Learning path
    path("learning-path/", LearningPathView.as_view(), name="learning-path"),
    path("learning-path/update/", LearningPathUpdateView.as_view(), name="learning-path-update"),
    path("learning-path/reset/", reset_learning_path, name="reset-learning-path"),
    
    # Content and progress
    path("content/<int:pk>/", LearningContentDetailView.as_view(), name="content-detail"),
    path("content/<int:content_id>/progress/", update_progress, name="update-progress"),
    path("progress/", UserProgressListView.as_view(), name="progress-list"),
    
    # ========== TEACHER ENDPOINTS ==========
    # Content management
    path("teacher/contents/", TeacherContentListView.as_view(), name="teacher-content-list"),
    path("teacher/content/create/", LearningContentCreateView.as_view(), name="content-create"),
    path("teacher/content/<int:pk>/update/", LearningContentUpdateView.as_view(), name="content-update"),
    path("teacher/content/<int:pk>/delete/", LearningContentDeleteView.as_view(), name="content-delete"),
    
    # Analytics
    path("teacher/analytics/", TeacherAnalyticsView.as_view(), name="teacher-analytics"),
    path("teacher/analytics/content/<int:content_id>/", get_content_analytics, name="content-analytics"),
]

# ========== API DOCUMENTATION ==========
"""
STUDENT ENDPOINTS:
1. GET  /api/adaptive-learning/dashboard/           - Complete adaptive learning dashboard
2. GET  /api/adaptive-learning/recommended/         - Personalized content recommendations
3. GET  /api/adaptive-learning/recommendations/     - List of AI recommendations
4. POST /api/adaptive-learning/recommendations/{id}/click/ - Mark recommendation as clicked
5. GET  /api/adaptive-learning/learning-path/       - Get or create learning path
6. PUT  /api/adaptive-learning/learning-path/update/ - Update learning path
7. POST /api/adaptive-learning/learning-path/reset/ - Reset and create new path
8. GET  /api/adaptive-learning/content/{id}/        - Content details with personalized difficulty
9. POST /api/adaptive-learning/content/{id}/progress/ - Update progress on content
10. GET /api/adaptive-learning/progress/            - List user's content progress

TEACHER ENDPOINTS:
1. GET  /api/adaptive-learning/teacher/contents/    - List all content
2. POST /api/adaptive-learning/teacher/content/create/ - Create new content
3. PUT  /api/adaptive-learning/teacher/content/{id}/update/ - Update content
4. DELETE /api/adaptive-learning/teacher/content/{id}/delete/ - Delete content
5. GET  /api/adaptive-learning/teacher/analytics/   - Teacher analytics dashboard
6. GET  /api/adaptive-learning/teacher/analytics/content/{id}/ - Detailed content analytics
"""
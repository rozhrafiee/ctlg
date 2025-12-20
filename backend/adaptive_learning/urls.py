from django.urls import path

from .views import (
    RecommendedContentView,
    LearningContentDetailView,
    LearningContentCreateView,
    LearningContentUpdateView,
    LearningScenarioDetailView,
    UserProgressListView,
    update_progress,
)

urlpatterns = [
    path("recommended/", RecommendedContentView.as_view(), name="learning-recommended"),
    path("content/", LearningContentCreateView.as_view(), name="learning-create"),
    path("content/<int:pk>/", LearningContentDetailView.as_view(), name="learning-detail"),
    path("content/<int:pk>/update/", LearningContentUpdateView.as_view(), name="learning-update"),
    path("scenarios/<int:pk>/", LearningScenarioDetailView.as_view(), name="scenario-detail"),
    path("progress/", UserProgressListView.as_view(), name="progress-list"),
    path("content/<int:content_id>/progress/", update_progress, name="progress-update"),
]



from django.urls import path

from .views import (
    CognitiveTestListView,
    CognitiveTestDetailView,
    TestSessionListView,
    start_session,
    submit_session,
)

urlpatterns = [
    path("tests/", CognitiveTestListView.as_view(), name="tests-list"),
    path("tests/<int:pk>/", CognitiveTestDetailView.as_view(), name="tests-detail"),
    path("sessions/", TestSessionListView.as_view(), name="sessions-list"),
    path("tests/<int:pk>/start/", start_session, name="tests-start"),
    path("sessions/<int:session_id>/submit/", submit_session, name="sessions-submit"),
]



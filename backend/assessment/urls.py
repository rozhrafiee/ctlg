from django.urls import path

from .views import (
    CognitiveTestListView,
    CognitiveTestDetailView,
    CognitiveTestCreateView,
    CognitiveTestUpdateView,
    TestSessionListView,
    TestSessionDetailView,
    start_session,
    submit_session,
    add_question_to_test,
    get_placement_test,
)

urlpatterns = [
    path("tests/", CognitiveTestListView.as_view(), name="tests-list"),
    path("tests/placement/", get_placement_test, name="placement-test"),
    path("tests/create/", CognitiveTestCreateView.as_view(), name="tests-create"),
    path("tests/<int:pk>/", CognitiveTestDetailView.as_view(), name="tests-detail"),
    path("tests/<int:pk>/update/", CognitiveTestUpdateView.as_view(), name="tests-update"),
    path("tests/<int:test_id>/questions/", add_question_to_test, name="tests-add-question"),
    path("sessions/", TestSessionListView.as_view(), name="sessions-list"),
    path("sessions/<int:pk>/", TestSessionDetailView.as_view(), name="sessions-detail"),
    path("tests/<int:pk>/start/", start_session, name="tests-start"),
    path("sessions/<int:session_id>/submit/", submit_session, name="sessions-submit"),
]



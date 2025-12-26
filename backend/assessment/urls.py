from django.urls import path
from . import views  # این خط را اضافه کن

from .views import (
    # ویوهای اصلی
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
    user_progress,
    
    # ویوهای جدید
    get_content_test_recommendation,
    get_student_dashboard,
    take_content_test,
    create_content_test,
    # 🔥 ویوهای جدید را اینجا اضافه کن:
    get_teacher_tests,
    create_placement_test,
    delete_test,
    get_test_questions,
    delete_question,
)

urlpatterns = [
    # ========== API برای دانشجو ==========
    path("tests/", CognitiveTestListView.as_view(), name="tests-list"),
    path("tests/placement/", get_placement_test, name="placement-test"),
    path("tests/<int:pk>/", CognitiveTestDetailView.as_view(), name="tests-detail"),
    path("tests/<int:pk>/start/", start_session, name="tests-start"),
    
    path("sessions/", TestSessionListView.as_view(), name="sessions-list"),
    path("sessions/<int:pk>/", TestSessionDetailView.as_view(), name="sessions-detail"),
    path("sessions/<int:session_id>/submit/", submit_session, name="sessions-submit"),
    
    path("progress/", user_progress, name="user-progress"),
    path("dashboard/", get_student_dashboard, name="student-dashboard"),
    
    # API جدید برای آزمون‌های محتوا
    path("content/<int:content_id>/test/recommendation/", 
         get_content_test_recommendation, 
         name="content-test-recommendation"),
    path("content/<int:content_id>/test/take/", 
         take_content_test, 
         name="take-content-test"),
    
    # ========== API برای استاد ==========
    path("teacher/tests/create/", CognitiveTestCreateView.as_view(), name="tests-create"),
    path("teacher/tests/<int:pk>/update/", CognitiveTestUpdateView.as_view(), name="tests-update"),
    path("teacher/content/<int:content_id>/test/create/", 
         create_content_test, 
         name="create-content-test"),
    path("teacher/tests/<int:test_id>/questions/", 
         add_question_to_test, 
         name="tests-add-question"),
    
    # 🔥 URLهای مدیریت آزمون‌ها توسط مدرس
    path("teacher/tests/all/", get_teacher_tests, name="teacher-all-tests"),
    path("teacher/tests/placement/create/", 
         create_placement_test, 
         name="create-placement-test"),
    path("teacher/tests/<int:pk>/delete/", 
         delete_test, 
         name="delete-test"),
    
    # 🔥 URLهای مدیریت سوالات
    path("teacher/tests/<int:test_id>/questions/list/", 
         get_test_questions, 
         name="test-questions-list"),
    path("teacher/questions/<int:question_id>/delete/", 
         delete_question, 
         name="delete-question"),
]
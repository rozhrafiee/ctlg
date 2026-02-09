from django.urls import path
from .views import *

urlpatterns = [
    path("teacher/tests/all/", TeacherTestListView.as_view()),#tested
    path("teacher/tests/create/", CognitiveTestCreateView.as_view()),#tested
    path("teacher/tests/placement/create/", create_placement_test),#tested
    path("teacher/tests/update/<int:pk>/", CognitiveTestUpdateView.as_view()),
    path("teacher/tests/delete/<int:pk>/", CognitiveTestDeleteView.as_view()),
    path("content/<int:content_id>/test/create/", create_test_for_content),#tested
    path("teacher/tests/<int:test_id>/questions/list/", list_questions_for_test),
    path("teacher/tests/<int:test_id>/questions/", add_question_to_test),#tested
    path("teacher/questions/<int:question_id>/delete/", delete_question),#tested
    path("teacher/questions/<int:pk>/update/", QuestionUpdateView.as_view()),
    path("tests/<int:test_id>/start/", start_test_session),#tested
    path("tests/<int:test_id>/", get_test_detail),
    path("sessions/<int:session_id>/questions/<int:question_id>/answer/", submit_answer),#tested
    path("sessions/<int:session_id>/finish/", finish_test_session),#tested
    path("tests/", StudentTestListView.as_view()),#tested
    path("teacher/reviews/pending/", PendingReviewsListView.as_view()),#tested
    path("teacher/sessions/<int:session_id>/", get_session_details),
    path("teacher/sessions/<int:session_id>/grade/", submit_manual_grade),
        # کارنامه یک آزمون خاص
    path('results/<int:pk>/', UserTestResultDetailView.as_view(), name='test_result_detail'),
    
    # تاریخچه تمام آزمون‌های کاربر
    path('my-history/', StudentHistoryListView.as_view(), name='student_history'),
    path('student/results/<int:pk>/', StudentTestDetailView.as_view(), name='student_test_detail'),
]   

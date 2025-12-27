from django.urls import path
from . import views

urlpatterns = [
    # ========== API برای دانشجو ==========
    # لیست و جزئیات آزمون‌ها
    path("tests/", views.CognitiveTestListView.as_view(), name="tests-list"),
    path("tests/placement/", views.get_placement_test, name="placement-test"),
    path("tests/<int:pk>/", views.CognitiveTestDetailView.as_view(), name="tests-detail"),
    path("tests/<int:pk>/start/", views.start_session, name="tests-start"),
    
    # مدیریت جلسات آزمون
    path("sessions/", views.TestSessionListView.as_view(), name="sessions-list"),
    path("sessions/<int:pk>/", views.TestSessionDetailView.as_view(), name="sessions-detail"),
    path("sessions/<int:session_id>/submit/", views.submit_session, name="sessions-submit"),
    
    # پیشرفت و داشبورد
    path("progress/", views.user_progress, name="user-progress"),
    path("dashboard/", views.get_student_dashboard, name="student-dashboard"),
    
    # آزمون‌های محتوا
    path("content/<int:content_id>/test/recommendation/", 
         views.get_content_test_recommendation, 
         name="content-test-recommendation"),
    path("content/<int:content_id>/test/take/", 
         views.take_content_test, 
         name="take-content-test"),
    
    # ========== API برای استاد ==========
    # مدیریت آزمون‌ها
    path("teacher/tests/create/", 
         views.CognitiveTestCreateView.as_view(), 
         name="tests-create"),
    path("teacher/tests/<int:pk>/update/", 
         views.CognitiveTestUpdateView.as_view(), 
         name="tests-update"),
    path("teacher/tests/all/", 
         views.get_teacher_tests, 
         name="teacher-all-tests"),
    path("teacher/tests/<int:pk>/delete/", 
         views.delete_test, 
         name="delete-test"),
    path("teacher/tests/placement/create/", 
         views.create_placement_test, 
         name="create-placement-test"),
    path("teacher/tests/<int:test_id>/statistics/",
         views.get_test_statistics,
         name="test-statistics"),
    
    # مدیریت سوالات
    path("teacher/tests/<int:test_id>/questions/", 
         views.add_question_to_test, 
         name="tests-add-question"),
    path("teacher/tests/<int:test_id>/questions/list/", 
         views.get_test_questions, 
         name="test-questions-list"),
    path("teacher/questions/<int:question_id>/delete/", 
         views.delete_question, 
         name="delete-question"),
    
    # آزمون‌های محتوا (برای استاد)
    path("teacher/content/<int:content_id>/test/create/", 
         views.create_content_test, 
         name="create-content-test"),
]

# ========== API Documentation ==========
"""
دانشجو:
1. GET /api/assessment/tests/ - لیست آزمون‌های قابل دسترسی
2. GET /api/assessment/tests/placement/ - دریافت آزمون تعیین سطح
3. GET /api/assessment/tests/{id}/ - جزئیات آزمون
4. POST /api/assessment/tests/{id}/start/ - شروع آزمون
5. GET /api/assessment/sessions/ - لیست جلسات آزمون
6. GET /api/assessment/sessions/{id}/ - جزئیات جلسه آزمون
7. POST /api/assessment/sessions/{id}/submit/ - ارسال پاسخ‌ها
8. GET /api/assessment/progress/ - پیشرفت کاربر
9. GET /api/assessment/dashboard/ - داشبورد دانشجو
10. GET /api/assessment/content/{id}/test/recommendation/ - پیشنهاد آزمون محتوا
11. POST /api/assessment/content/{id}/test/take/ - شرکت در آزمون محتوا

استاد:
1. POST /api/assessment/teacher/tests/create/ - ایجاد آزمون جدید
2. PUT /api/assessment/teacher/tests/{id}/update/ - ویرایش آزمون
3. GET /api/assessment/teacher/tests/all/ - همه آزمون‌ها
4. DELETE /api/assessment/teacher/tests/{id}/delete/ - حذف آزمون
5. POST /api/assessment/teacher/tests/placement/create/ - ایجاد آزمون تعیین سطح
6. POST /api/assessment/teacher/tests/{id}/questions/ - افزودن سوال
7. GET /api/assessment/teacher/tests/{id}/questions/list/ - لیست سوالات آزمون
8. DELETE /api/assessment/teacher/questions/{id}/delete/ - حذف سوال
9. GET /api/assessment/teacher/content/{id}/test/create/ - ایجاد آزمون برای محتوا
10. GET /api/assessment/teacher/tests/{id}/statistics/ - آمار آزمون
"""
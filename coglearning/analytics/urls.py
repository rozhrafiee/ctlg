from django.urls import path
from .views import TeacherDashboardView, UserMyStatsView, AdminGlobalStatsView, TeacherStudentStatsView, StudentDashboardView

urlpatterns = [
    # Citizen endpoints
    path('my-stats/', UserMyStatsView.as_view(), name='my_stats'),
    
    # Admin endpoints
    path('system-report/', AdminGlobalStatsView.as_view(), name='admin_report'),
    
    # Teacher endpoints
    path('student-report/<int:student_id>/', TeacherStudentStatsView.as_view(), name='student_report'),

    path('teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('student-dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
]
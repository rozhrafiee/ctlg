from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from analytics.models import UserPerformanceSummary


class AnalyticsAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='an_student', password='pass12345', role='student',
            cognitive_level=30, has_taken_placement_test=True,
        )
        self.teacher = User.objects.create_user(
            username='an_teacher', password='pass12345', role='teacher',
        )
        self.admin = User.objects.create_user(
            username='an_admin', password='pass12345', role='admin',
        )
        UserPerformanceSummary.objects.get_or_create(user=self.student)

    def test_student_dashboard(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/analytics/student-dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('identity', res.data)

    def test_teacher_dashboard(self):
        self.client.force_authenticate(user=self.teacher)
        res = self.client.get('/api/analytics/teacher-dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('stats', res.data)

    def test_system_report_admin_only(self):
        self.client.force_authenticate(user=self.teacher)
        denied = self.client.get('/api/analytics/system-report/')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        ok = self.client.get('/api/analytics/system-report/')
        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        self.assertIn('total_citizens', ok.data)

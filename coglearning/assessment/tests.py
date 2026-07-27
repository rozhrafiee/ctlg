from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from assessment.models import CognitiveTest, TestSession


class ResultOwnershipTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner',
            password='StrongPass123!',
            role='student',
        )
        self.other = User.objects.create_user(
            username='other',
            password='StrongPass123!',
            role='student',
        )
        self.teacher = User.objects.create_user(
            username='teacher',
            password='StrongPass123!',
            role='teacher',
        )
        self.test = CognitiveTest.objects.create(
            title='Ownership Test',
            test_type='general',
            created_by=self.teacher,
            is_active=True,
        )
        self.session = TestSession.objects.create(
            user=self.owner,
            test=self.test,
            status='completed',
            expires_at=timezone.now() + timezone.timedelta(hours=1),
            total_score=85,
            finished_at=timezone.now(),
        )

    def test_student_cannot_read_another_users_result(self):
        self.client.force_authenticate(user=self.other)
        url = reverse('test_result_detail', kwargs={'pk': self.session.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_can_read_own_result(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse('student_test_detail', kwargs={'pk': self.session.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_score'], 85)

    def test_history_only_returns_own_sessions(self):
        other_session = TestSession.objects.create(
            user=self.other,
            test=self.test,
            status='completed',
            expires_at=timezone.now() + timezone.timedelta(hours=1),
            total_score=50,
            finished_at=timezone.now(),
        )
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(reverse('student_history'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {item['id'] for item in response.data}
        self.assertIn(self.session.id, ids)
        self.assertNotIn(other_session.id, ids)


class IsTeacherPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='stu', password='StrongPass123!', role='student'
        )
        self.teacher = User.objects.create_user(
            username='tea', password='StrongPass123!', role='teacher'
        )
        self.admin = User.objects.create_user(
            username='adm', password='StrongPass123!', role='admin'
        )

    def test_teacher_and_admin_can_list_teacher_tests(self):
        url = '/api/assessment/teacher/tests/all/'
        self.client.force_authenticate(user=self.teacher)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.student)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)


class CatalogIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='catalog_stu',
            password='StrongPass123!',
            role='student',
            cognitive_level=40,
            has_taken_placement_test=True,
        )
        CognitiveTest.objects.create(
            title='Alpha Memory',
            test_type='general',
            min_level=1,
            is_active=True,
        )
        CognitiveTest.objects.create(
            title='Beta Logic',
            test_type='general',
            min_level=1,
            is_active=True,
        )

    def test_student_test_list_returns_catalog_meta(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/assessment/tests/', {'sort_algo': 'merge', 'q': 'Alpha'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('catalog_meta', response.data)
        self.assertEqual(response.data['catalog_meta']['sort_algorithm'], 'merge')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Alpha Memory')

from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from adaptive_learning.models import LearningContent


class AdaptiveLearningAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='adapt_student', password='pass12345', role='student',
            cognitive_level=20, has_taken_placement_test=True,
        )
        self.teacher = User.objects.create_user(
            username='adapt_teacher', password='pass12345', role='teacher',
        )
        self.content = LearningContent.objects.create(
            title='Media Literacy Basics',
            content_type='text',
            body='Intro text',
            min_level=1,
            max_level=50,
            author=self.teacher,
            is_active=True,
        )

    def test_student_recommended_requires_auth(self):
        res = self.client.get('/api/adaptive-learning/recommended/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_fetch_recommended(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/adaptive-learning/recommended/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_teacher_can_list_own_content(self):
        self.client.force_authenticate(user=self.teacher)
        res = self.client.get('/api/adaptive-learning/teacher/contents/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

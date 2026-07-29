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

    def test_mark_recommendation_clicked_persists(self):
        self.client.force_authenticate(user=self.student)
        first = self.client.get('/api/adaptive-learning/recommended/')
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        rows = first.data if isinstance(first.data, list) else first.data.get('results', [])
        self.assertTrue(len(rows) >= 1)
        rec_id = rows[0]['id']

        content_id = rows[0]['content']['id'] if isinstance(rows[0].get('content'), dict) else rows[0].get('content')
        clicked = self.client.post(f'/api/adaptive-learning/recommendations/{rec_id}/click/')
        self.assertEqual(clicked.status_code, status.HTTP_200_OK)
        self.assertTrue(clicked.data.get('is_clicked'))
        self.assertTrue(clicked.data.get('progress_recorded'))

        progress = self.client.get('/api/adaptive-learning/progress/')
        self.assertEqual(progress.status_code, status.HTTP_200_OK)
        progress_rows = progress.data if isinstance(progress.data, list) else progress.data.get('results', [])
        self.assertTrue(any(p.get('content') == content_id and p.get('is_completed') for p in progress_rows))

        # Completed content is removed from recommendations on the next generate pass
        second = self.client.get('/api/adaptive-learning/recommended/')
        rows2 = second.data if isinstance(second.data, list) else second.data.get('results', [])
        match = next((r for r in rows2 if r['id'] == rec_id), None)
        self.assertIsNone(match)

    def test_roadmap_includes_content_below_user_level(self):
        """Students above content min_level still get unfinished items on the roadmap."""
        self.student.cognitive_level = 50
        self.student.save(update_fields=['cognitive_level'])
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/adaptive-learning/learning-roadmap/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        steps = res.data.get('steps') or []
        self.assertTrue(len(steps) >= 1)
        self.assertTrue(any(s['id'] == self.content.id for s in steps))
        self.assertTrue(any(s.get('is_available') for s in steps))

    def test_learning_path_items_are_actionable(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/adaptive-learning/learning-path/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('items') or []
        self.assertTrue(len(items) >= 1)
        self.assertTrue(items[0]['content']['id'])
        self.assertTrue(items[0]['is_unlocked'])

    def test_teacher_can_list_own_content(self):
        self.client.force_authenticate(user=self.teacher)
        res = self.client.get('/api/adaptive-learning/teacher/contents/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

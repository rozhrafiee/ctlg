from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from ml_engine.models import ChurnPrediction, RetentionNotification
from ml_engine.services import predict_churn, reset_model_cache


User = get_user_model()


class ChurnAPITests(TestCase):
    def setUp(self):
        reset_model_cache()
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student1',
            password='testpass123',
            role='student',
            cognitive_level=25,
        )
        self.teacher = User.objects.create_user(
            username='teacher1',
            password='testpass123',
            role='teacher',
        )

    def test_unauthenticated_denied(self):
        response = self.client.get('/api/ml/churn/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_student_churn_prediction_shape(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/ml/churn/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('is_at_risk', data)
        self.assertIn('probability', data)
        self.assertIn('confidence', data)
        self.assertIsInstance(data['is_at_risk'], bool)
        self.assertIsInstance(data['probability'], float)
        self.assertIsInstance(data['confidence'], float)
        self.assertTrue(ChurnPrediction.objects.filter(user=self.student).exists())

    def test_teacher_cannot_access_churn(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get('/api/ml/churn/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_dismiss_notification(self):
        prediction = ChurnPrediction.objects.create(
            user=self.student,
            probability=0.8,
            confidence=0.6,
            is_at_risk=True,
            features_snapshot={},
        )
        notif = RetentionNotification.objects.create(
            user=self.student,
            message='Stay motivated!',
            prediction=prediction,
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/ml/notifications/{notif.id}/dismiss/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_dismissed)
        self.assertIsNotNone(notif.dismissed_at)

    def test_list_undismissed_notifications(self):
        RetentionNotification.objects.create(
            user=self.student,
            message='Keep going!',
            is_dismissed=False,
        )
        RetentionNotification.objects.create(
            user=self.student,
            message='Old one',
            is_dismissed=True,
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/ml/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['message'], 'Keep going!')

    def test_heuristic_fallback_without_model(self):
        """بدون فایل مدل، heuristic باید کار کند."""
        reset_model_cache()
        result = predict_churn(self.student, persist=True, create_notification=False)
        self.assertIn('is_at_risk', result)
        self.assertIn('probability', result)
        self.assertIn('confidence', result)

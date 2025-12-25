from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from assessment.models import CognitiveTest, Question, Choice

User = get_user_model()

class AssessmentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='stu', password='pass', role='student')

    def obtain_token(self):
        resp = self.client.post('/api/accounts/token/', {'username': 'stu', 'password': 'pass'}, format='json')
        self.assertEqual(resp.status_code, 200)
        return resp.data['access']

    def test_start_and_submit_session_flow(self):
        # create a test and question
        test = CognitiveTest.objects.create(title='RegTest', is_placement_test=False, max_level=5)
        q = Question.objects.create(test=test, text='Q1')
        choice = Choice.objects.create(question=q, text='A', score=100)

        token = self.obtain_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # start session
        start_url = f'/api/assessment/tests/{test.id}/start/'
        resp = self.client.post(start_url)
        self.assertEqual(resp.status_code, 201)
        session_id = resp.data['session_id']

        # submit session
        submit_url = f'/api/assessment/sessions/{session_id}/submit/'
        payload = {'answers': [{'question': q.id, 'selected_choice': choice.id}]}
        resp = self.client.post(submit_url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('session', resp.data)
        self.assertTrue(resp.data['session']['total_score'] > 0)

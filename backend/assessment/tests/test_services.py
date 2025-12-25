from django.test import TestCase
from django.contrib.auth import get_user_model

from assessment.models import CognitiveTest, Question, Choice, TestSession
from assessment.services import grade_session

User = get_user_model()

class GradeSessionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student1', password='pass')

    def test_grade_session_placement_updates_user_level(self):
        test = CognitiveTest.objects.create(title='Placement', is_placement_test=True, max_level=10)
        q = Question.objects.create(test=test, text='Q1')
        Choice.objects.create(question=q, text='A', score=5)
        Choice.objects.create(question=q, text='B', score=0)

        session = TestSession.objects.create(user=self.user, test=test)

        answers = [{'question': q.id, 'selected_choice': Choice.objects.filter(question=q).first().id}]

        session = grade_session(session, answers)
        self.user.refresh_from_db()

        self.assertTrue(self.user.has_taken_placement_test)
        self.assertGreater(self.user.cognitive_level, 1)
        self.assertIsNotNone(session.finished_at)

    def test_grade_session_regular_level_up(self):
        # user at level 1
        self.user.cognitive_level = 1
        self.user.save()

        test = CognitiveTest.objects.create(title='Regular', is_placement_test=False, max_level=2)
        q = Question.objects.create(test=test, text='Q1')
        Choice.objects.create(question=q, text='A', score=10)

        session = TestSession.objects.create(user=self.user, test=test)

        answers = [{'question': q.id, 'selected_choice': Choice.objects.filter(question=q).first().id}]

        session = grade_session(session, answers)
        self.user.refresh_from_db()

        # With full score, and max_level >= old_level, user should level up to 2
        self.assertEqual(self.user.cognitive_level, 2)
        self.assertEqual(session.resulting_level, 2)

# backend/assessment/services.py
from django.utils import timezone
from accounts.services import AccountService

class AssessmentService:
    @staticmethod
    def calculate_auto_score(session):
        all_questions = session.test.questions.all()
        total_points = sum(q.points for q in all_questions)
        
        if total_points == 0:
            return 0

        earned = 0
        for ans in session.answers.all():
            if ans.question.question_type == 'mcq' and ans.selected_choice and ans.selected_choice.is_correct:
                ans.score_earned = ans.question.points
                earned += ans.score_earned
                ans.is_reviewed = True
                ans.save()
        
        return (earned / total_points * 100)

    @classmethod
    def process_test_completion(cls, session):
        test = session.test
        has_essay = test.questions.filter(question_type='text').exists()
        
        session.total_score = cls.calculate_auto_score(session)
        session.finished_at = timezone.now()

        if has_essay:
            session.status = 'pending_review'
        else:
            session.status = 'completed'
            cls.apply_level_logic(session.user, session)
        
        session.save()

    @staticmethod
    def apply_level_logic(user, session):
        test = session.test
        score = session.total_score
        old_level = user.cognitive_level if user.cognitive_level is not None else 1
        new_level = old_level
        reason = ""

        if test.test_type == 'placement':
            new_level = int(score)
            user.has_taken_placement_test = True
            reason = "تعیین سطح اولیه"
        elif score >= test.passing_score:
            increment = 5 if score >= 90 else 2
            if test.target_level >= (old_level - 10):
                new_level = old_level + increment
                reason = f"قبولی در آزمون {test.title}"

        AccountService.update_user_level(user, new_level, reason, session)
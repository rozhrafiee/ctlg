from typing import Iterable

from django.utils import timezone

from .models import TestSession, Answer, Choice


def calculate_level_from_score(score: float) -> int:
    """Simple example mapping score to cognitive level."""
    if score < 20:
        return 1
    if score < 40:
        return 2
    if score < 60:
        return 3
    if score < 80:
        return 4
    return 5


def grade_session(session: TestSession, answers_payload: Iterable[dict]) -> TestSession:
    """
    Create Answer objects, compute total score and resulting level, and update user.

    answers_payload: list of {question: id, selected_choice: id | None, text_answer: str | None}
    """
    total_score = 0.0

    for item in answers_payload:
        choice_obj = None
        score = 0.0
        if item.get("selected_choice"):
            choice_obj = Choice.objects.get(
                id=item["selected_choice"], question_id=item["question"]
            )
            score = choice_obj.score
        Answer.objects.create(
            session=session,
            question_id=item["question"],
            selected_choice=choice_obj,
            text_answer=item.get("text_answer") or "",
            score=score,
        )
        total_score += score

    session.total_score = total_score
    session.finished_at = timezone.now()
    session.resulting_level = calculate_level_from_score(total_score)
    session.save(update_fields=["total_score", "finished_at", "resulting_level"])

    user = session.user
    user.cognitive_level = session.resulting_level or user.cognitive_level
    user.save(update_fields=["cognitive_level"])

    return session



# assessment/services.py
from typing import Iterable
from django.utils import timezone
from django.db import transaction
from .models import TestSession, Answer, Choice


def grade_session(session: TestSession, answers_payload: Iterable[dict]) -> TestSession:
    """
    تصحیح آزمون و افزایش سطح فقط با آزمون
    answers_payload: list of {question: id, selected_choice: id | None, text_answer: str | None}
    """
    total_score = 0.0
    max_possible_score = 0
    
    with transaction.atomic():
        # 1. ذخیره پاسخ‌ها و محاسبه نمره
        for item in answers_payload:
            choice_obj = None
            score = 0.0
            
            if item.get("selected_choice"):
                try:
                    choice_obj = Choice.objects.get(
                        id=item["selected_choice"], 
                        question_id=item["question"]
                    )
                    score = choice_obj.score
                except Choice.DoesNotExist:
                    score = 0
            
            # محاسبه بیشترین نمره ممکن برای این سوال
            question_max_score = Choice.objects.filter(
                question_id=item["question"]
            ).aggregate(models.Max('score'))['score__max'] or 0
            max_possible_score += question_max_score
            
            Answer.objects.create(
                session=session,
                question_id=item["question"],
                selected_choice=choice_obj,
                text_answer=item.get("text_answer") or "",
                score=score,
            )
            total_score += score
        
        # 2. محاسبه درصد نمره
        if max_possible_score > 0:
            score_percentage = (total_score / max_possible_score) * 100
        else:
            score_percentage = 0
        
        session.total_score = score_percentage
        session.finished_at = timezone.now()
        
        # 3. منطق افزایش سطح (فقط با آزمون)
        user = session.user
        old_level = getattr(user, "cognitive_level", 1)
        
        if session.test.is_placement_test:
            # آزمون تعیین سطح: سطح را مستقیماً تنظیم کن
            new_level = _calculate_placement_level(score_percentage)
            session.resulting_level = new_level
            
            # به‌روزرسانی کاربر
            if hasattr(user, 'cognitive_level'):
                user.cognitive_level = new_level
                user.has_taken_placement_test = True
                user.save(update_fields=['cognitive_level', 'has_taken_placement_test'])
        
        else:
            # آزمون عادی: فقط در شرایط خاص سطح افزایش می‌یابد
            session.resulting_level = old_level
            
            # شرط افزایش سطح: نمره بالا + آزمون چالشی
            if (score_percentage >= 80 and 
                session.test.max_level >= old_level):
                
                # فقط یک سطح افزایش
                new_level = min(old_level + 1, 10)  # حداکثر سطح ۱۰
                
                # مطمئن شو سطح جدید در محدوده آزمون است
                if new_level <= session.test.max_level:
                    session.resulting_level = new_level
                    
                    # به‌روزرسانی کاربر
                    if hasattr(user, 'cognitive_level'):
                        user.cognitive_level = new_level
                        user.save(update_fields=['cognitive_level'])
        
        session.save()
        return session


def _calculate_placement_level(score_percentage):
    """محاسبه سطح از آزمون تعیین سطح"""
    if score_percentage >= 90:
        return 10
    elif score_percentage >= 80:
        return 9
    elif score_percentage >= 70:
        return 8
    elif score_percentage >= 60:
        return 7
    elif score_percentage >= 50:
        return 6
    elif score_percentage >= 40:
        return 5
    elif score_percentage >= 30:
        return 4
    elif score_percentage >= 20:
        return 3
    elif score_percentage >= 10:
        return 2
    else:
        return 1
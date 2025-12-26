# assessment/services.py
from typing import Iterable
from django.utils import timezone
from django.db import transaction
from .models import TestSession, Answer, Choice


def grade_session(session: TestSession, answers_payload: Iterable[dict]) -> TestSession:
    """
    تصحیح آزمون - هر آزمون نمره از 100
    منطق: هر سوال 10 نمره (برای 10 سوال = 100)
    """
    total_correct = 0
    total_questions = len(answers_payload)
    
    with transaction.atomic():
        for item in answers_payload:
            is_correct = False
            selected_choice = None
            
            if item.get("selected_choice"):
                try:
                    selected_choice = Choice.objects.get(
                        id=item["selected_choice"], 
                        question_id=item["question"]
                    )
                    is_correct = selected_choice.is_correct  # فقط بررسی درست/غلط
                except Choice.DoesNotExist:
                    is_correct = False
            
            # ذخیره پاسخ - هر سوال 10 نمره اگر درست باشد
            Answer.objects.create(
                session=session,
                question_id=item["question"],
                selected_choice=selected_choice,
                text_answer=item.get("text_answer") or "",
                score=10 if is_correct else 0  # هر سوال 10 نمره
            )
            
            if is_correct:
                total_correct += 1
        
        # محاسبه نمره از 100
        if total_questions > 0:
            score_percentage = (total_correct / total_questions) * 100
        else:
            score_percentage = 0
        
        session.total_score = round(score_percentage, 2)
        session.finished_at = timezone.now()
        
        # منطق افزایش سطح
        user = session.user
        old_level = getattr(user, "cognitive_level", 1)
        
        if session.test.is_placement_test:
            # آزمون تعیین سطح
            new_level = _calculate_placement_level(score_percentage)
            session.resulting_level = new_level
            
            if hasattr(user, 'cognitive_level'):
                user.cognitive_level = new_level
                user.has_taken_placement_test = True
                user.save(update_fields=['cognitive_level', 'has_taken_placement_test'])
        
        else:
            # آزمون عادی - افزایش سطح
            session.resulting_level = old_level
            
            # شرط افزایش سطح: نمره بالای 80% + آزمون چالشی
            if (score_percentage >= 80 and 
                session.test.max_level >= old_level):
                
                # فقط یک سطح افزایش
                new_level = min(old_level + 1, 10)
                
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
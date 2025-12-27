from typing import Iterable
from django.utils import timezone
from django.db import transaction
from .models import TestSession, Answer, Choice, Question
import logging

logger = logging.getLogger(__name__)


def grade_session(session: TestSession, answers_payload: Iterable[dict]) -> TestSession:
    """
    تصحیح آزمون - هر آزمون نمره از 100
    منطق: هر سوال 10 نمره (برای 10 سوال = 100)
    """
    total_correct = 0
    total_questions = len(answers_payload)
    points_earned = 0
    total_points = total_questions * 10  # هر سوال 10 نمره
    
    with transaction.atomic():
        for item in answers_payload:
            is_correct = False
            selected_choice = None
            score = 0
            
            try:
                question = Question.objects.get(id=item["question"])
                
                if item.get("selected_choice"):
                    try:
                        selected_choice = Choice.objects.get(
                            id=item["selected_choice"], 
                            question_id=item["question"]
                        )
                        is_correct = selected_choice.is_correct
                        score = question.points if is_correct else 0
                    except Choice.DoesNotExist:
                        is_correct = False
                        score = 0
                elif item.get("text_answer"):
                    # برای سوالات متنی، فعلاً نمره نمی‌دهیم (نیاز به بررسی دستی)
                    score = 0
                    is_correct = False
            
            except Question.DoesNotExist:
                logger.error(f"Question {item.get('question')} not found")
                continue
            
            # ذخیره پاسخ
            Answer.objects.create(
                session=session,
                question=question,
                selected_choice=selected_choice,
                text_answer=item.get("text_answer") or "",
                score=score,
                time_spent_seconds=item.get("time_spent_seconds", 0)
            )
            
            if is_correct:
                total_correct += 1
                points_earned += score
        
        # محاسبه نمره از 100
        if total_questions > 0:
            score_percentage = (total_correct / total_questions) * 100
        else:
            score_percentage = 0
        
        # به‌روزرسانی جلسه
        session.total_score = round(score_percentage, 2)
        session.finished_at = timezone.now()
        session.points_earned = points_earned
        session.total_points = total_points
        session.correct_answers = total_correct
        session.wrong_answers = total_questions - total_correct
        session.passed = score_percentage >= session.test.passing_score
        session.status = 'completed'
        
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
        
        # ایجاد رکورد پیشرفت برای آزمون‌های محتوا
        if session.test.related_content:
            from .models import ContentTestProgress
            ContentTestProgress.objects.update_or_create(
                user=user,
                content=session.test.related_content,
                test=session.test,
                defaults={
                    'completed': True,
                    'score': session.total_score,
                    'completed_at': session.finished_at
                }
            )
        
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


def calculate_test_difficulty(test_id):
    """محاسبه سطح دشواری آزمون بر اساس عملکرد کاربران"""
    sessions = TestSession.objects.filter(
        test_id=test_id,
        finished_at__isnull=False
    )
    
    if not sessions.exists():
        return 0
    
    avg_score = sessions.aggregate(avg=Avg('total_score'))['avg']
    
    # تبدیل میانگین نمره به سطح دشواری (1-10)
    # 100-90: آسان (3-1)
    # 89-70: متوسط (6-4)
    # 69-50: سخت (8-7)
    # زیر 50: بسیار سخت (10-9)
    
    if avg_score >= 90:
        return 1  # بسیار آسان
    elif avg_score >= 80:
        return 3  # آسان
    elif avg_score >= 70:
        return 5  # متوسط
    elif avg_score >= 60:
        return 7  # سخت
    elif avg_score >= 50:
        return 9  # بسیار سخت
    else:
        return 10  # فوق‌العاده سخت
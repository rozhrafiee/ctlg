from django.utils import timezone
from django.db import transaction
from accounts.services import AccountService
from analytics.models import UserPerformanceSummary, Notification

class AssessmentService:

    @staticmethod
    def calculate_auto_score(session):
        """محاسبه نمره سوالات تستی و ذخیره نمره هر پاسخ"""
        all_questions = session.test.questions.all()
        total_points = sum(q.points for q in all_questions)
        
        if total_points == 0:
            return 0

        earned = 0
        # استفاده از select_related برای بهینه‌سازی کوئری در حلقه
        for ans in session.answers.select_related('question', 'selected_choice').all():
            if ans.question.question_type == 'mcq' and ans.selected_choice:
                if ans.selected_choice.is_correct:
                    ans.score_earned = ans.question.points
                    earned += ans.score_earned
                else:
                    ans.score_earned = 0
                
                ans.is_reviewed = True
                ans.save()
        
        return (earned / total_points * 100)

    @classmethod
    def process_test_completion(cls, session):
        """مدیریت پایان آزمون و ارجاع به تصحیح یا اتمام قطعی"""
        with transaction.atomic():
            test = session.test
            has_essay = test.questions.filter(question_type='text').exists()
            
            session.total_score = cls.calculate_auto_score(session)
            session.finished_at = timezone.now()

            if has_essay:
                session.status = 'pending_review'
                # در اینجا آمار آنالیتیکس آپدیت نمی‌شود چون نمرات تشریحی هنوز صفر هستند
            else:
                session.status = 'completed'
                # ۱. اعمال منطق سطح (Level)
                cls.apply_level_logic(session.user, session)
                # ۲. بروزرسانی پروفایل شناختی (Analytics)
                cls.update_analytics_profile(session)
            
            session.save()

    @staticmethod
    def update_analytics_profile(session):
        """تفکیک نمرات بر اساس دسته‌بندی سوالات و بروزرسانی میانگین‌ها"""
        user = session.user
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)
        count = summary.total_tests_completed
        
        # دسته‌بندی پاسخ‌ها بر اساس نوع سوال
        categories = ['memory', 'focus', 'logic']
        answers = session.answers.select_related('question').all()

        for cat in categories:
            cat_answers = [a for a in answers if a.question.category == cat]
            
            if cat_answers:
                cat_earned = sum(a.score_earned for a in cat_answers)
                cat_total = sum(a.question.points for a in cat_answers)
                cat_score = (cat_earned / cat_total * 100) if cat_total > 0 else 0
                
                # فرمول میانگین متحرک (Moving Average)
                current_avg = getattr(summary, f'avg_{cat}_score')
                new_avg = (current_avg * count + cat_score) / (count + 1)
                setattr(summary, f'avg_{cat}_score', round(new_avg, 2))

                # سیستم هشدار هوشمند
                if cat_score < 40:
                    Notification.objects.create(
                        user=user,
                        message=f"هشدار: عملکرد شما در سوالات بخش '{cat}' ضعیف بود. پیشنهاد می‌شود روی این مهارت بیشتر کار کنید."
                    )

        summary.total_tests_completed += 1
        summary.save()

    @staticmethod
    def apply_level_logic(user, session):
        """منطق ارتقای سطح کاربر"""
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
            # فقط اگر آزمون در سطح توانمندی فعلی کاربر باشد ارتقا صورت می‌گیرد
            if test.target_level >= (old_level - 10):
                new_level = min(old_level + increment, 100)
                reason = f"قبولی در آزمون {test.title}"

        if new_level != old_level:
            AccountService.update_user_level(user, new_level, reason, session)
from django.utils import timezone
from django.db import transaction
from accounts.services import AccountService

class AssessmentService:
    @staticmethod
    def calculate_auto_score(session):
        """محاسبه نمره خودکار برای سوالات تستی"""
        all_questions = session.test.questions.all()
        total_points = sum(q.points for q in all_questions)
        
        if total_points == 0:
            return 0

        earned = 0
        # استفاده از select_related برای بهینگی در حلقه و جلوگیری از کوئری‌های تکراری
        answers = session.answers.select_related('question', 'selected_choice').all()
        
        for ans in answers:
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
        """مدیریت اتمام آزمون و تعیین وضعیت تستی یا تشریحی"""
        with transaction.atomic():
            test = session.test
            # بررسی وجود سوال تشریحی برای تغییر وضعیت به pending_review
            has_essay = test.questions.filter(question_type='text').exists()
            
            session.total_score = cls.calculate_auto_score(session)
            session.finished_at = timezone.now()

            if has_essay:
                session.status = 'pending_review'
            else:
                session.status = 'completed'
                # اعمال منطق سطح‌بندی
                cls.apply_level_logic(session.user, session)
                # به‌روزرسانی آنالیتیکس و میانگین مهارت‌ها
                cls.update_analytics_profile(session)
            
            session.save()

    @staticmethod
    def update_analytics_profile(session):
        """به‌روزرسانی میانگین نمرات در دسته‌بندی‌های مختلف در ماژول آنالیتیکس"""
        # --- ایمپورت محلی برای رفع قطعی ارور ImportError ---
        from analytics.models import UserPerformanceSummary, Notification
        
        user = session.user
        # دریافت یا ایجاد خلاصه وضعیت کاربر
        summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)
        count = summary.total_tests_completed
        
        categories = ['memory', 'focus', 'logic']
        answers = session.answers.select_related('question').all()

        for cat in categories:
            # جدا کردن پاسخ‌های مربوط به هر دسته (حافظه، تمرکز، منطق)
            cat_answers = [a for a in answers if a.question.category == cat]
            
            if cat_answers:
                cat_earned = sum(a.score_earned for a in cat_answers)
                cat_total = sum(a.question.points for a in cat_answers)
                cat_score = (cat_earned / cat_total * 100) if cat_total > 0 else 0
                
                # فرمول میانگین متحرک برای بروزرسانی پروفایل
                current_avg = getattr(summary, f'avg_{cat}_score')
                new_avg = (current_avg * count + cat_score) / (count + 1)
                setattr(summary, f'avg_{cat}_score', round(new_avg, 2))

                # صدور هشدار در صورت عملکرد ضعیف در یک مهارت خاص
                if cat_score < 40:
                    Notification.objects.create(
                        user=user,
                        message=f"توجه: نمره شما در بخش مهارت '{cat}' (در آزمون {session.test.title}) پایین بود. تمرین بیشتری توصیه می‌شود."
                    )

        # افزایش تعداد کل آزمون‌های انجام شده برای محاسبات بعدی
        summary.total_tests_completed += 1
        summary.save()

    @staticmethod
    def apply_level_logic(user, session):
        """منطق ارتقای سطح شناختی کاربر بر اساس نمره آزمون"""
        test = session.test
        score = session.total_score
        old_level = user.cognitive_level if user.cognitive_level is not None else 1
        new_level = old_level
        reason = ""

        # منطق آزمون تعیین سطح
        if test.test_type == 'placement':
            new_level = int(score)
            user.has_taken_placement_test = True
            reason = "نتیجه آزمون تعیین سطح اولیه"
            
        # منطق آزمون‌های معمولی
        elif score >= test.passing_score:
            # نمرات عالی جایزه بیشتری دارند
            increment = 5 if score >= 90 else 2
            
            # ارتقای سطح فقط در صورتی که آزمون متناسب با سطح کاربر باشد
            if test.target_level >= (old_level - 10):
                new_level = min(old_level + increment, 100) # سقف سطح ۱۰۰ است
                reason = f"موفقیت در آزمون {test.title} با نمره {int(score)}"

        # اگر تغییری در سطح ایجاد شده، از طریق سرویس اکانت اعمال شود
        if new_level != old_level:
            AccountService.update_user_level(user, new_level, reason, session)
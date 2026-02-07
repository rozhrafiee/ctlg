from analytics.models import LevelHistory

class AccountService:
    @staticmethod
    def update_user_level(user, new_level, reason, session=None):
        """به‌روزرسانی سطح ۱-۱۰۰ و ثبت در تاریخچه (مدل Analytics)"""
        old_level = user.cognitive_level or 1
        new_level = max(1, min(new_level, 100))

        if old_level != new_level:
            user.cognitive_level = new_level
            user.save(update_fields=['cognitive_level'])
            
            # ثبت در دیتابیس analytics
            LevelHistory.objects.create(
                user=user,
                old_level=old_level,
                new_level=new_level,
                reason=reason,
                test_session=session
            )
        return user
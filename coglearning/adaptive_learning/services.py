from .models import LearningContent, LearningPath, LearningPathItem, ContentRecommendation, UserContentProgress

class AdaptiveLearningEngine:
    @staticmethod
    def generate_recommendations(user):
        """الگوریتم پیشنهاد محتوا بر اساس سطح ۱-۱۰۰ کاربر"""
        level = user.cognitive_level or 1
        ContentRecommendation.objects.filter(user=user).delete()
        
        # پیدا کردن محتوا در بازه سطح فعلی کاربر (مثلاً ۵ پله سخت‌تر یا ساده‌تر)
        contents = LearningContent.objects.filter(
            is_active=True,
            min_level__lte=level + 5,
            max_level__gte=level - 5
        ).exclude(usercontentprogress__user=user, usercontentprogress__is_completed=True).order_by('?')[:10]

        for c in contents:
            ContentRecommendation.objects.create(
                user=user, 
                content=c, 
                recommendation_type=f"پیشنهاد شده برای سطح {level}",
                priority_weight=1.0
            )

    @staticmethod
    def create_or_refresh_path(user):
        """ساخت یا بازنشانی مسیر یادگیری فعال"""
        LearningPath.objects.filter(user=user, is_active=True).update(is_active=False)
        level = user.cognitive_level or 1
        path = LearningPath.objects.create(user=user, name=f"مسیر یادگیری سطح {level}")
        
        # ۵ محتوای مناسب سطح کاربر (بازه سطح شامل سطح فعلی) که کاربر هنوز تکمیل نکرده است
        base_qs = LearningContent.objects.filter(is_active=True).exclude(
            usercontentprogress__user=user,
            usercontentprogress__is_completed=True
        )

        contents = list(
            base_qs.filter(min_level__lte=level, max_level__gte=level)
            .order_by('min_level', 'id')[:5]
        )

        # اگر به اندازه کافی نبود، از محتواهای سطح‌های بالاتر هم اضافه کن
        if len(contents) < 5:
            need = 5 - len(contents)
            future = list(
                base_qs.filter(min_level__gt=level)
                .order_by('min_level', 'id')[:need]
            )
            contents.extend(future)

        for i, c in enumerate(contents):
            LearningPathItem.objects.create(
                path=path, 
                content=c, 
                order=i+1, 
                # قفل/باز بر اساس سطح مورد نیاز
                is_unlocked=(c.min_level <= level)
            )
        return path
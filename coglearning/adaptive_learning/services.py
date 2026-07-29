from .models import LearningContent, LearningPath, LearningPathItem, ContentRecommendation, UserContentProgress

class AdaptiveLearningEngine:
    @staticmethod
    def record_content_completed(user, content):
        """Mark learning content as fully completed for progress tracking."""
        progress, _ = UserContentProgress.objects.get_or_create(
            user=user,
            content=content,
            defaults={"progress_percent": 0, "is_completed": False},
        )
        if progress.progress_percent < 100 or not progress.is_completed:
            progress.progress_percent = 100
            progress.is_completed = True
            progress.save(update_fields=["progress_percent", "is_completed", "last_accessed"])
        return progress

    @staticmethod
    def generate_recommendations(user):
        """الگوریتم پیشنهاد محتوا بر اساس سطح ۱-۱۰۰ کاربر.

        Existing rows (including is_clicked) are kept so mark-as-read survives refetches.
        """
        level = user.cognitive_level or 1

        # «خوانده شد» must show up under پیشرفت — backfill progress for older clicks.
        for rec in ContentRecommendation.objects.filter(user=user, is_clicked=True).select_related("content"):
            AdaptiveLearningEngine.record_content_completed(user, rec.content)

        # Drop recs for completed or inactive content; keep the rest (and their IDs).
        ContentRecommendation.objects.filter(
            user=user,
            content__usercontentprogress__user=user,
            content__usercontentprogress__is_completed=True,
        ).delete()
        ContentRecommendation.objects.filter(user=user, content__is_active=False).delete()

        existing_ids = set(
            ContentRecommendation.objects.filter(user=user).values_list("content_id", flat=True)
        )
        need = max(0, 10 - len(existing_ids))
        if need == 0:
            return

        contents = (
            LearningContent.objects.filter(
                is_active=True,
                min_level__lte=level + 5,
                max_level__gte=level - 5,
            )
            .exclude(usercontentprogress__user=user, usercontentprogress__is_completed=True)
            .exclude(id__in=existing_ids)
            .order_by("?")[:need]
        )

        ContentRecommendation.objects.bulk_create(
            [
                ContentRecommendation(
                    user=user,
                    content=c,
                    recommendation_type=f"پیشنهاد شده برای سطح {level}",
                    priority_weight=1.0,
                )
                for c in contents
            ]
        )

    @staticmethod
    def create_or_refresh_path(user):
        """ساخت یا بازنشانی مسیر یادگیری فعال"""
        LearningPath.objects.filter(user=user, is_active=True).update(is_active=False)
        level = user.cognitive_level or 1
        path = LearningPath.objects.create(user=user, name=f"مسیر یادگیری سطح {level}")

        base_qs = LearningContent.objects.filter(is_active=True).exclude(
            usercontentprogress__user=user,
            usercontentprogress__is_completed=True,
        )

        # ۱) محتوایی که سطح کاربر داخل بازه min/max آن است
        contents = list(
            base_qs.filter(min_level__lte=level, max_level__gte=level)
            .order_by("min_level", "id")[:5]
        )

        # ۲) محتواهای قابل انجام (min_level <= سطح) حتی اگر max_level پایین‌تر باشد
        if len(contents) < 5:
            need = 5 - len(contents)
            have = {c.id for c in contents}
            more = list(
                base_qs.filter(min_level__lte=level)
                .exclude(id__in=have)
                .order_by("-min_level", "id")[:need]
            )
            contents.extend(more)

        # ۳) محتواهای سطح بالاتر (قفل) برای ادامه مسیر
        if len(contents) < 5:
            need = 5 - len(contents)
            have = {c.id for c in contents}
            future = list(
                base_qs.filter(min_level__gt=level)
                .exclude(id__in=have)
                .order_by("min_level", "id")[:need]
            )
            contents.extend(future)

        for i, c in enumerate(contents):
            LearningPathItem.objects.create(
                path=path,
                content=c,
                order=i + 1,
                is_unlocked=(c.min_level <= level),
            )
        return path
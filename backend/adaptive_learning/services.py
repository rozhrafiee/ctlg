from .models import (
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
    ContentRecommendation,
)


class AdaptiveLearningEngine:
    def __init__(self, user):
        self.user = user
        self.level = getattr(user, "cognitive_level", 1)

    # ---------- RECOMMENDED ----------
    def get_recommended_content(self, limit=20):
        completed_ids = UserContentProgress.objects.filter(
            user=self.user,
            completed_at__isnull=False,
        ).values_list("content_id", flat=True)

        return LearningContent.objects.filter(
            is_active=True,
            min_level__lte=self.level,
            max_level__gte=self.level,
        ).exclude(id__in=completed_ids).order_by("difficulty")[:limit]

    # ---------- LEARNING PATH ----------
    def create_learning_path(self):
        path = LearningPath.objects.create(
            user=self.user,
            name="Adaptive Learning Path",
            is_active=True,
        )

        contents = self.get_recommended_content(limit=10)

        for i, content in enumerate(contents, start=1):
            LearningPathItem.objects.create(
                learning_path=path,
                content=content,
                order=i,
                unlocked=(i == 1),
            )

        if contents:
            path.current_content = contents[0]
            path.save(update_fields=["current_content"])

        return path


def create_initial_learning_path(user):
    return AdaptiveLearningEngine(user).create_learning_path()

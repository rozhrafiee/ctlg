from .models import LearningPath, LearningPathItem, LearningContent

class AdaptiveLearningEngine:
    def __init__(self, user):
        self.user = user
        self.level = getattr(user, "cognitive_level", 1)

    def create_learning_path(self):
        LearningPath.objects.filter(user=self.user, is_active=True).update(is_active=False)

        path = LearningPath.objects.create(
            user=self.user,
            name=f"مسیر یادگیری سطح {self.level}",
            is_active=True,
        )

        contents = LearningContent.objects.filter(
            is_active=True,
            min_level__lte=self.level,
            max_level__gte=self.level,
        ).order_by("difficulty")[:10]

        for idx, content in enumerate(contents):
            LearningPathItem.objects.create(
                learning_path=path,
                content=content,
                order=idx + 1,
                unlocked=(idx == 0),
            )

        if contents:
            path.current_content = contents[0]
            path.save(update_fields=["current_content"])

        return path

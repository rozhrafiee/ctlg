from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Alert

User = get_user_model()


class AlertSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_label = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            "id",
            "user_id",
            "user_label",
            "message",
            "created_at",
            "is_read",
            "severity",
        ]
        read_only_fields = ["id", "created_at"]

    def get_user_label(self, obj):
        """
        نمایش امن نام کاربر:
        - username اگر وجود داشت
        - در غیر این صورت email
        - وگرنه None
        """
        if not obj.user:
            return None

        return (
            getattr(obj.user, "username", None)
            or getattr(obj.user, "email", None)
            or str(obj.user)
        )


class AlertCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["user", "message", "severity"]


class AlertUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["is_read"]

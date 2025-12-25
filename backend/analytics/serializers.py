from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    
    class Meta:
        model = Alert
        fields = ["id", "user_id", "user_username", "message", "created_at", "is_read", "severity"]
        read_only_fields = ["id", "created_at"]


class AlertCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["user", "message", "severity"]


class AlertUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["is_read"]



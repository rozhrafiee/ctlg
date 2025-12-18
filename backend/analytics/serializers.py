from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["id", "user", "message", "created_at", "is_read", "severity"]
        read_only_fields = ["id", "created_at"]


class AlertCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["user", "message", "severity"]


class AlertUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["is_read"]



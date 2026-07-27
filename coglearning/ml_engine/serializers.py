from rest_framework import serializers
from .models import ChurnPrediction, RetentionNotification


class ChurnPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChurnPrediction
        fields = (
            'id',
            'probability',
            'confidence',
            'is_at_risk',
            'features_snapshot',
            'created_at',
        )
        read_only_fields = fields


class RetentionNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetentionNotification
        fields = (
            'id',
            'message',
            'prediction',
            'is_dismissed',
            'dismissed_at',
            'created_at',
        )
        read_only_fields = fields

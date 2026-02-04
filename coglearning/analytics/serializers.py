from rest_framework import serializers
from .models import LevelHistory, UserPerformanceSummary, LearningAnalytics

class LevelHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelHistory
        fields = '__all__'

class UserPerformanceSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPerformanceSummary
        fields = '__all__'

class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = '__all__'
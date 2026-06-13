from rest_framework import serializers
from .models import User
from analytics.models import LevelHistory 

class LevelHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelHistory
        fields = ['old_level', 'new_level', 'reason', 'timestamp']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    # تاریخچه تغییرات سطح را از مدل analytics فراخوانی می‌کند
    level_history = LevelHistorySerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'cognitive_level', 'has_taken_placement_test', 
            'level_history'
        ]
        read_only_fields = ['cognitive_level', 'has_taken_placement_test']
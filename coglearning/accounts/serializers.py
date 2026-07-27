from rest_framework import serializers
from .models import User
from analytics.models import LevelHistory 

class LevelHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelHistory
        fields = ['old_level', 'new_level', 'reason', 'timestamp']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[('student', 'شهروند'), ('teacher', 'مسئول شهری (مدرس)')],
        required=False,
        default='student',
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role']

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError(
                "ثبت‌نام با نقش مدیر از طریق ثبت‌نام عمومی مجاز نیست."
            )
        if value not in ('student', 'teacher'):
            raise serializers.ValidationError(
                "نقش مجاز فقط student یا teacher است."
            )
        return value

    def create(self, validated_data):
        validated_data.setdefault('role', 'student')
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
            'preferred_sort_algorithm', 'preferred_search_algorithm',
            'default_sort_field', 'level_history',
        ]
        read_only_fields = ['cognitive_level', 'has_taken_placement_test']
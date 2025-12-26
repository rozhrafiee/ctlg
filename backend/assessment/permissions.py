# assessment/permissions.py
from rest_framework import permissions


class IsTeacherForAssessment(permissions.BasePermission):
    """
    اجازه دسترسی فقط به استاد برای ماژول assessment
    """
    
    def has_permission(self, request, view):
        # بررسی احراز هویت
        if not request.user or not request.user.is_authenticated:
            return False
        
        # بررسی role کاربر
        user_role = getattr(request.user, 'role', None)
        
        # استاد یا ادمین دسترسی دارند
        return user_role in ['teacher', 'admin']


class IsStudentForAssessment(permissions.BasePermission):
    """
    اجازه دسترسی فقط به دانشجو برای ماژول assessment
    """
    
    def has_permission(self, request, view):
        # بررسی احراز هویت
        if not request.user or not request.user.is_authenticated:
            return False
        
        # بررسی role کاربر
        user_role = getattr(request.user, 'role', None)
        
        # فقط دانشجو دسترسی دارد
        return user_role == 'student'
# backend/accounts/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """دسترسی مخصوص مدیر سیستم"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_superuser)
        )

class IsTeacher(permissions.BasePermission):
    """دسترسی مخصوص اساتید"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'teacher'
        )

class IsStudent(permissions.BasePermission):
    """دسترسی مخصوص شهروندان"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'student'
        )

class HasTakenPlacementTest(permissions.BasePermission):
    """بررسی اینکه شهروند حتما آزمون تعیین سطح را داده باشد"""
    message = "ابتدا باید آزمون تعیین سطح را پشت سر بگذارید."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # اساتید و ادمین‌ها محدود نمی‌شوند
        if request.user.role != 'student':
            return True
        return request.user.has_taken_placement_test
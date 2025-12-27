from rest_framework import permissions


class IsTeacherForAdaptiveLearning(permissions.BasePermission):
    """
    Permission for teachers in adaptive learning module
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['teacher', 'admin']


class IsStudentForAdaptiveLearning(permissions.BasePermission):
    """
    Permission for students in adaptive learning module
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role == 'student'
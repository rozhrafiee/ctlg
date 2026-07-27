from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'cognitive_level', 'has_taken_placement_test', 'is_staff')
    list_filter = ('role', 'is_staff', 'has_taken_placement_test')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Cognitive Profile', {
            'fields': ('role', 'cognitive_level', 'has_taken_placement_test'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Cognitive Profile', {
            'fields': ('role',),
        }),
    )

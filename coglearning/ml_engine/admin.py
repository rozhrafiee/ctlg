from django.contrib import admin
from .models import ChurnPrediction, RetentionNotification


@admin.register(ChurnPrediction)
class ChurnPredictionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_at_risk', 'probability', 'confidence', 'created_at')
    list_filter = ('is_at_risk',)
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)


@admin.register(RetentionNotification)
class RetentionNotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_dismissed', 'created_at', 'dismissed_at')
    list_filter = ('is_dismissed',)
    search_fields = ('user__username', 'message')
    readonly_fields = ('created_at',)

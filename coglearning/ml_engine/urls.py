from django.urls import path
from .views import (
    ChurnPredictView,
    RetentionNotificationListView,
    RetentionNotificationDismissView,
)

urlpatterns = [
    path('churn/', ChurnPredictView.as_view(), name='ml_churn_predict'),
    path('notifications/', RetentionNotificationListView.as_view(), name='ml_notifications'),
    path(
        'notifications/<int:pk>/dismiss/',
        RetentionNotificationDismissView.as_view(),
        name='ml_notification_dismiss',
    ),
]

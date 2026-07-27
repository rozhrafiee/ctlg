from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

from accounts.permissions import IsStudent
from .models import RetentionNotification
from .serializers import RetentionNotificationSerializer
from .services import predict_churn, dismiss_notification


class ChurnPredictView(APIView):
    """پیش‌بینی ریزش برای شهروند احراز هویت‌شده"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        result = predict_churn(request.user, persist=True, create_notification=True)
        payload = {
            'is_at_risk': result['is_at_risk'],
            'probability': result['probability'],
            'confidence': result['confidence'],
        }
        if 'notification' in result:
            payload['notification'] = result['notification']
        return Response(payload)


class RetentionNotificationListView(APIView):
    """لیست اعلان‌های نگه‌داشت ردنشده کاربر جاری"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = RetentionNotification.objects.filter(
            user=request.user,
            is_dismissed=False,
        )
        serializer = RetentionNotificationSerializer(qs, many=True)
        return Response(serializer.data)


class RetentionNotificationDismissView(APIView):
    """رد کردن یک اعلان نگه‌داشت"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(
            RetentionNotification,
            pk=pk,
            user=request.user,
        )
        dismiss_notification(request.user, notif.id)
        notif.refresh_from_db()
        return Response(
            RetentionNotificationSerializer(notif).data,
            status=status.HTTP_200_OK,
        )

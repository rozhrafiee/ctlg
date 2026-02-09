# backend/cog_learning/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # پنل مدیریت پیش‌فرض جنگو
    path('admin/', admin.site.urls),

    # مسیرهای مربوط به احراز هویت و کاربران
    path('api/accounts/', include('accounts.urls')),

    # مسیرهای مربوط به موتور آزمون‌ها (Assessment)
    path('api/assessment/', include('assessment.urls')),

    # مسیرهای مربوط به محتوا و یادگیری انطباقی (Adaptive Learning)
    path('api/adaptive-learning/', include('adaptive_learning.urls')),

    # مسیرهای مربوط به گزارش‌گیری و تحلیل (Analytics)
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

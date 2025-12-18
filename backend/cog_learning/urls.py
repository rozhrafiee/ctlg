from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/assessment/", include("assessment.urls")),
    path("api/learning/", include("adaptive_learning.urls")),
    path("api/analytics/", include("analytics.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



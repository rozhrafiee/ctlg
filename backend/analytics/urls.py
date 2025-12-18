from django.urls import path

from .views import overview, AlertListCreateView, AlertUpdateView, MyAlertsListView

urlpatterns = [
    path("overview/", overview, name="analytics-overview"),
    path("alerts/", AlertListCreateView.as_view(), name="alerts-list-create"),
    path("alerts/<int:pk>/", AlertUpdateView.as_view(), name="alerts-update"),
    path("my-alerts/", MyAlertsListView.as_view(), name="my-alerts"),
]



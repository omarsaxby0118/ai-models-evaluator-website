from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("models", views.AIModelViewSet, basename="aimodel")
router.register("evaluations", views.EvaluationViewSet, basename="evaluation")

urlpatterns = [
    path("health/", views.health, name="health"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("", include(router.urls)),
]

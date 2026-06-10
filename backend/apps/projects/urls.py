from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, SiteSurveyViewSet, NetMeteringViewSet, AMCViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'surveys', SiteSurveyViewSet, basename='survey')
router.register(r'net-metering', NetMeteringViewSet, basename='net-metering')
router.register(r'amc', AMCViewSet, basename='amc')

urlpatterns = [
    path('', include(router.urls)),
]

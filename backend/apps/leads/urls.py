from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, NoteViewSet, ActivityViewSet, FollowUpViewSet

router = DefaultRouter()
router.register(r'', LeadViewSet, basename='lead')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'followups', FollowUpViewSet, basename='followup')

urlpatterns = [
    path('', include(router.urls)),
]

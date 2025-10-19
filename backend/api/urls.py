from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet, MemberViewSet, AdminViewSet,
    PublicationViewSet, RedSocialViewSet
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'members', MemberViewSet, basename='member')
router.register(r'admins', AdminViewSet, basename='admin')
router.register(r'publications', PublicationViewSet, basename='publication')
router.register(r'social-links', RedSocialViewSet, basename='social-link')

urlpatterns = [
    path('', include(router.urls)),
]

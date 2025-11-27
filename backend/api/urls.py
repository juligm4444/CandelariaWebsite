from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet, MemberViewSet,
    PublicationViewSet, RedSocialViewSet
)
from .auth_views import (
    register_view,
    login_view,
    logout_view,
    current_user_view,
    change_password_view,
    check_email_view,
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'members', MemberViewSet, basename='member')
router.register(r'publications', PublicationViewSet, basename='publication')
router.register(r'social-links', RedSocialViewSet, basename='social-link')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current_user'),
    path('auth/change-password/', change_password_view, name='change_password'),
    path('auth/check-email/', check_email_view, name='check_email'),
    
    # ViewSet routes
    path('', include(router.urls)),
]

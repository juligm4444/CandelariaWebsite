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
    update_profile_view,
    change_password_view,
    check_email_view,
    forgot_password_view,
    reset_password_view,
)
from .payment_views import (
    payment_config_view,
    create_checkout_session_view,
    stripe_webhook_view,
    create_payment_view,
    payu_webhook_view,
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
    path('auth/me/update/', update_profile_view, name='update_profile'),
    path('auth/change-password/', change_password_view, name='change_password'),
    path('auth/check-email/', check_email_view, name='check_email'),
    path('auth/forgot-password/', forgot_password_view, name='forgot_password'),
    path('auth/reset-password/', reset_password_view, name='reset_password'),

    # Payment endpoints
    path('payments/config/', payment_config_view, name='payments_config'),
    path('payments/checkout-session/', create_checkout_session_view, name='create_checkout_session'),
    path('payments/create-payment/', create_payment_view, name='create_payment'),
    path('payments/webhooks/stripe/', stripe_webhook_view, name='stripe_webhook'),
    path('payments/webhooks/payu/', payu_webhook_view, name='payu_webhook'),

    # ViewSet routes
    path('', include(router.urls)),
]

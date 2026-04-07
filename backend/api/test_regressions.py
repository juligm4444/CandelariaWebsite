from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InternalWhitelistEntry, Team


@override_settings(
    DEBUG=True,
    SECURE_SSL_REDIRECT=False,
    ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'],
)
class PublicApiRegressionTests(APITestCase):
    def test_public_endpoints_allow_anonymous_reads(self):
        Team.objects.create(name_en='Core', name_es='Nucleo')

        for path in ('/api/teams/', '/api/members/', '/api/publications/'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, status.HTTP_200_OK, path)


@override_settings(
    DEBUG=True,
    SECURE_SSL_REDIRECT=False,
    ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'],
)
class RegistrationRegressionTests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name_en='Validation Team', name_es='Equipo Validacion')
        InternalWhitelistEntry.objects.create(
            email='invitee@example.com',
            internal_role=InternalWhitelistEntry.ROLE_MEMBER,
        )

    def test_internal_registration_missing_fields_returns_400_without_creating_user(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'email': 'invitee@example.com',
                'password': 'strongpass123',
                'full_name': 'Invitee Test',
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {
                'team_id': ['Team is required for internal members.'],
                'career_key': ['Career is required for internal members.'],
                'image': ['Profile image is required for internal members.'],
            },
        )
        self.assertFalse(User.objects.filter(username='invitee@example.com').exists())


@override_settings(
    DEBUG=True,
    SECURE_SSL_REDIRECT=False,
    ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'],
)
class LogoutRegressionTests(APITestCase):
    def test_logout_without_access_token_is_not_blocked_by_auth(self):
        response = self.client.post('/api/auth/logout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {'error': 'Refresh token is required'})
from unittest.mock import patch
import hashlib
import hmac
import json
import time

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from django.test import override_settings

from .models import Team, Member, PaymentCheckoutSession, PaymentWebhookEvent


class TeamManagementPermissionsTests(APITestCase):
	def setUp(self):
		self.team_a = Team.objects.create(name_en='Team A', name_es='Equipo A')
		self.team_b = Team.objects.create(name_en='Team B', name_es='Equipo B')

		self.leader_user = User.objects.create_user(username='leader', password='test12345')
		self.leader = Member.objects.create(
			user=self.leader_user,
			name='Leader A',
			email='leader@a.com',
			career_en='Design',
			career_es='Diseño',
			role_en='Team Leader',
			role_es='Líder de Equipo',
			team=self.team_a,
			is_team_leader=True,
			is_active=True,
		)

		self.coleader_user = User.objects.create_user(username='coleader', password='test12345')
		self.coleader = Member.objects.create(
			user=self.coleader_user,
			name='Coleader A',
			email='coleader@a.com',
			career_en='Design',
			career_es='Diseño',
			role_en='Co-Leader',
			role_es='Co-Líder',
			team=self.team_a,
			is_coleader=True,
			is_active=True,
		)

		self.member_user = User.objects.create_user(username='member', password='test12345')
		self.member = Member.objects.create(
			user=self.member_user,
			name='Member A',
			email='member@a.com',
			career_en='Design',
			career_es='Diseño',
			role_en='Member',
			role_es='Miembro',
			team=self.team_a,
			is_active=True,
		)

		self.other_user = User.objects.create_user(username='other', password='test12345')
		self.other_member = Member.objects.create(
			user=self.other_user,
			name='Member B',
			email='member@b.com',
			career_en='Design',
			career_es='Diseño',
			role_en='Member',
			role_es='Miembro',
			team=self.team_b,
			is_active=True,
		)

	@patch('api.views.add_email_to_whitelist_section', return_value=True)
	def test_leader_can_invite_any_role(self, _mock_add):
		self.client.force_authenticate(user=self.leader_user)
		response = self.client.post('/api/members/invite/', {'email': 'new@a.com', 'role': 'leaders', 'confirm': True}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	@patch('api.views.add_email_to_whitelist_section', return_value=True)
	def test_coleader_can_only_invite_members(self, _mock_add):
		self.client.force_authenticate(user=self.coleader_user)

		denied = self.client.post('/api/members/invite/', {'email': 'x@a.com', 'role': 'leaders', 'confirm': True}, format='json')
		self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

		allowed = self.client.post('/api/members/invite/', {'email': 'y@a.com', 'role': 'members', 'confirm': True}, format='json')
		self.assertEqual(allowed.status_code, status.HTTP_200_OK)

	def test_coleader_cannot_kick_leader(self):
		self.client.force_authenticate(user=self.coleader_user)
		response = self.client.post(f'/api/members/{self.leader.id}/kick/', {'confirm': True}, format='json')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_coleader_can_kick_normal_member(self):
		self.client.force_authenticate(user=self.coleader_user)
		response = self.client.post(f'/api/members/{self.member.id}/kick/', {'confirm': True}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.member.refresh_from_db()
		self.assertFalse(self.member.is_active)

	def test_leader_can_transfer_leadership_to_coleader(self):
		self.client.force_authenticate(user=self.leader_user)
		response = self.client.post(
			f'/api/members/{self.coleader.id}/transfer_leadership/',
			{'confirm': True},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

		self.leader.refresh_from_db()
		self.coleader.refresh_from_db()
		self.assertFalse(self.leader.is_team_leader)
		self.assertTrue(self.coleader.is_team_leader)
		self.assertFalse(self.coleader.is_coleader)

	def test_member_cannot_use_management_actions(self):
		self.client.force_authenticate(user=self.member_user)

		kick_resp = self.client.post(f'/api/members/{self.coleader.id}/kick/', {'confirm': True}, format='json')
		self.assertEqual(kick_resp.status_code, status.HTTP_403_FORBIDDEN)

		set_coleader_resp = self.client.post(
			f'/api/members/{self.other_member.id}/set_coleader/',
			{'confirm': True, 'is_coleader': True},
			format='json',
		)
		self.assertEqual(set_coleader_resp.status_code, status.HTTP_403_FORBIDDEN)

	def test_leader_can_set_and_remove_coleader(self):
		self.client.force_authenticate(user=self.leader_user)

		assign = self.client.post(
			f'/api/members/{self.member.id}/set_coleader/',
			{'confirm': True, 'is_coleader': True},
			format='json',
		)
		self.assertEqual(assign.status_code, status.HTTP_200_OK)
		self.member.refresh_from_db()
		self.assertTrue(self.member.is_coleader)

		remove = self.client.post(
			f'/api/members/{self.member.id}/set_coleader/',
			{'confirm': True, 'is_coleader': False},
			format='json',
		)
		self.assertEqual(remove.status_code, status.HTTP_200_OK)
		self.member.refresh_from_db()
		self.assertFalse(self.member.is_coleader)


@override_settings(PAYMENT_WEBHOOK_SECRET='whsec_test_secret')
class PaymentSecurityTests(APITestCase):
	def setUp(self):
		self.team = Team.objects.create(name_en='Payments Team', name_es='Equipo Pagos')
		self.user = User.objects.create_user(username='payuser', password='test12345')
		self.member = Member.objects.create(
			user=self.user,
			name='Pay User',
			email='payuser@example.com',
			career_en='Design',
			career_es='Diseno',
			role_en='Member',
			role_es='Miembro',
			team=self.team,
			is_active=True,
		)

	def _signature_header(self, payload_bytes, timestamp=None):
		timestamp = timestamp or int(time.time())
		signed = f'{timestamp}.{payload_bytes.decode("utf-8")}'.encode('utf-8')
		sig = hmac.new(b'whsec_test_secret', signed, hashlib.sha256).hexdigest()
		return f't={timestamp},v1={sig}'

	def test_create_checkout_session_requires_auth(self):
		response = self.client.post('/api/payments/checkout-session/', {}, format='json')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_create_checkout_session_success(self):
		self.client.force_authenticate(user=self.user)
		payload = {
			'item_type': 'membership',
			'item_id': 'gold-plan',
			'amount_cents': 2000,
			'currency': 'usd',
			'success_url': 'https://localhost:5173/success',
			'cancel_url': 'https://localhost:5173/cancel',
		}
		response = self.client.post('/api/payments/checkout-session/', payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(PaymentCheckoutSession.objects.filter(member=self.member).exists())

	def test_webhook_rejects_invalid_signature(self):
		payload = {
			'id': 'evt_invalid',
			'type': 'checkout.session.completed',
			'data': {'object': {'id': 'cs_test', 'metadata': {}}},
		}
		body = json.dumps(payload).encode('utf-8')
		response = self.client.post(
			'/api/payments/webhooks/stripe/',
			data=body,
			content_type='application/json',
			HTTP_STRIPE_SIGNATURE='t=1,v1=bad',
		)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_webhook_accepts_valid_signature_and_is_idempotent(self):
		session = PaymentCheckoutSession.objects.create(
			member=self.member,
			user=self.user,
			provider='stripe',
			idempotency_key='idem-test-1',
			item_type='membership',
			item_id='gold-plan',
			amount_cents=2000,
			currency='usd',
			status=PaymentCheckoutSession.STATUS_PENDING,
		)

		payload = {
			'id': 'evt_valid_1',
			'type': 'checkout.session.completed',
			'data': {'object': {'id': 'cs_test_1', 'metadata': {'reference': str(session.reference)}}},
		}
		body = json.dumps(payload).encode('utf-8')
		signature = self._signature_header(body)

		first = self.client.post(
			'/api/payments/webhooks/stripe/',
			data=body,
			content_type='application/json',
			HTTP_STRIPE_SIGNATURE=signature,
		)
		self.assertEqual(first.status_code, status.HTTP_200_OK)
		session.refresh_from_db()
		self.assertEqual(session.status, PaymentCheckoutSession.STATUS_SUCCEEDED)

		second = self.client.post(
			'/api/payments/webhooks/stripe/',
			data=body,
			content_type='application/json',
			HTTP_STRIPE_SIGNATURE=signature,
		)
		self.assertEqual(second.status_code, status.HTTP_200_OK)
		self.assertEqual(PaymentWebhookEvent.objects.filter(provider_event_id='evt_valid_1').count(), 1)

import hashlib
import hmac
import json
import time
import uuid
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PaymentCheckoutSession, PaymentWebhookEvent, SecurityAuditEvent, Payment, UserProfile
from .payment_serializers import CreateCheckoutSessionSerializer
from .throttles import AuthRateThrottle, BurstRateThrottle


def _client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR') or ''


def _create_signature_payload(timestamp, raw_body):
    return f'{timestamp}.{raw_body.decode("utf-8")}'.encode('utf-8')


def _verify_payu_signature(payload, api_key, merchant_id):
    """Verify PayU IPN MD5 signature.

    PayU signs: MD5(api_key~merchant_id~reference_sale~value~currency~state_pol)
    where value is rounded to 1 decimal place.
    """
    sign_received = str(payload.get('sign') or '').strip()
    if not sign_received:
        return False, 'Missing PayU signature.'

    if not api_key or not merchant_id:
        return False, 'PayU credentials not configured — rejecting webhook.'

    reference_sale = str(payload.get('reference_sale') or '').strip()
    value = str(payload.get('value') or payload.get('amount') or '').strip()
    currency = str(payload.get('currency') or '').strip()
    state_pol = str(payload.get('state_pol') or '').strip()

    if not all([reference_sale, value, currency, state_pol]):
        return False, 'Payload missing required fields for signature verification.'

    try:
        value_str = f'{float(value):.1f}'
    except (TypeError, ValueError):
        return False, 'Invalid value field in PayU payload.'

    raw = f'{api_key}~{merchant_id}~{reference_sale}~{value_str}~{currency}~{state_pol}'
    expected = hashlib.md5(raw.encode('utf-8')).hexdigest()

    if not hmac.compare_digest(expected.lower(), sign_received.lower()):
        return False, 'PayU signature mismatch.'

    return True, None


def _verify_stripe_signature(raw_body, signature_header, endpoint_secret, tolerance_seconds):
    if not signature_header or not endpoint_secret:
        return False, 'Missing signature or webhook secret.'

    components = {}
    for part in signature_header.split(','):
        if '=' not in part:
            continue
        key, value = part.split('=', 1)
        components.setdefault(key.strip(), []).append(value.strip())

    timestamps = components.get('t', [])
    signatures = components.get('v1', [])

    if not timestamps or not signatures:
        return False, 'Invalid Stripe signature header format.'

    timestamp = timestamps[0]
    try:
        ts = int(timestamp)
    except ValueError:
        return False, 'Invalid signature timestamp.'

    now = int(time.time())
    if abs(now - ts) > tolerance_seconds:
        return False, 'Webhook timestamp outside allowed tolerance.'

    signed_payload = _create_signature_payload(timestamp, raw_body)
    expected = hmac.HMAC(endpoint_secret.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()

    for sig in signatures:
        if hmac.compare_digest(expected, sig):
            return True, None

    return False, 'Signature verification failed.'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([BurstRateThrottle])
def payment_config_view(request):
    return Response(
        {
            'provider': getattr(settings, 'PAYMENT_PROVIDER', 'stripe'),
            'publishable_key': getattr(settings, 'PAYMENT_PUBLIC_KEY', ''),
            'default_currency': getattr(settings, 'PAYMENT_DEFAULT_CURRENCY', 'usd'),
            'purchases_enabled': bool(getattr(settings, 'PURCHASES_ENABLED', False)),
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([BurstRateThrottle])
def create_checkout_session_view(request):
    if not bool(getattr(settings, 'PURCHASES_ENABLED', False)):
        return Response(
            {'error': 'Purchases are temporarily unavailable while we complete payment maintenance.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    serializer = CreateCheckoutSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    idempotency_key = (
        request.headers.get('Idempotency-Key')
        or serializer.validated_data.get('idempotency_key')
        or str(uuid.uuid4())
    )

    profile = UserProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({'error': 'User profile required.'}, status=status.HTTP_403_FORBIDDEN)

    member = getattr(request.user, 'member_profile', None)

    existing = PaymentCheckoutSession.objects.filter(idempotency_key=idempotency_key, user=request.user).first()
    if existing:
        return Response(
            {
                'reference': str(existing.reference),
                'status': existing.status,
                'provider': existing.provider,
                'provider_session_id': existing.provider_session_id,
            },
            status=status.HTTP_200_OK,
        )

    with transaction.atomic():
        session = PaymentCheckoutSession.objects.create(
            member=member,
            user=request.user,
            provider=getattr(settings, 'PAYMENT_PROVIDER', 'stripe'),
            idempotency_key=idempotency_key,
            item_type=serializer.validated_data['item_type'],
            item_id=serializer.validated_data['item_id'],
            amount_cents=serializer.validated_data['amount_cents'],
            currency=serializer.validated_data['currency'],
            metadata=serializer.validated_data.get('metadata', {}),
            status=PaymentCheckoutSession.STATUS_CREATED,
        )

        SecurityAuditEvent.objects.create(
            event_type='payment.checkout.created',
            severity='info',
            actor_member=member,
            ip_address=_client_ip(request),
            details={
                'reference': str(session.reference),
                'provider': session.provider,
                'item_type': session.item_type,
                'item_id': session.item_id,
                'amount_cents': session.amount_cents,
            },
        )

    return Response(
        {
            'reference': str(session.reference),
            'status': session.status,
            'provider': session.provider,
            'publishable_key': getattr(settings, 'PAYMENT_PUBLIC_KEY', ''),
            'success_url': serializer.validated_data['success_url'],
            'cancel_url': serializer.validated_data['cancel_url'],
        },
        status=status.HTTP_201_CREATED,
    )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def stripe_webhook_view(request):
    raw_body = request.body or b''
    signature_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    endpoint_secret = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')
    tolerance_seconds = int(getattr(settings, 'PAYMENT_WEBHOOK_TOLERANCE_SECONDS', 300))

    verified, error_message = _verify_stripe_signature(raw_body, signature_header, endpoint_secret, tolerance_seconds)
    if not verified:
        SecurityAuditEvent.objects.create(
            event_type='payment.webhook.rejected',
            severity='warning',
            ip_address=_client_ip(request),
            details={'reason': error_message},
        )
        return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = json.loads(raw_body.decode('utf-8'))
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON payload.'}, status=status.HTTP_400_BAD_REQUEST)

    event_id = str(payload.get('id') or '').strip()
    event_type = str(payload.get('type') or '').strip()
    if not event_id or not event_type:
        return Response({'error': 'Invalid event payload.'}, status=status.HTTP_400_BAD_REQUEST)

    payload_hash = hashlib.sha256(raw_body).hexdigest()

    if PaymentWebhookEvent.objects.filter(provider='stripe', provider_event_id=event_id).exists():
        return Response({'status': 'duplicate_ignored'}, status=status.HTTP_200_OK)

    with transaction.atomic():
        webhook_event = PaymentWebhookEvent.objects.create(
            provider='stripe',
            provider_event_id=event_id,
            event_type=event_type,
            signature_verified=True,
            payload_hash=payload_hash,
            raw_payload=payload,
        )

        data_object = (payload.get('data') or {}).get('object') or {}
        provider_session_id = str(data_object.get('id') or '').strip()
        reference = ((data_object.get('metadata') or {}).get('reference') or '').strip()

        checkout = None
        if provider_session_id:
            checkout = PaymentCheckoutSession.objects.filter(provider='stripe', provider_session_id=provider_session_id).first()
        if not checkout and reference:
            checkout = PaymentCheckoutSession.objects.filter(reference=reference).first()

        if checkout:
            if event_type in {'checkout.session.completed', 'payment_intent.succeeded', 'invoice.paid'}:
                if checkout.status != PaymentCheckoutSession.STATUS_SUCCEEDED:
                    checkout.transition(PaymentCheckoutSession.STATUS_SUCCEEDED)
                    checkout.provider_session_id = checkout.provider_session_id or provider_session_id or None
                    checkout.save(update_fields=['status', 'provider_session_id', 'updated_at'])
            elif event_type in {'payment_intent.payment_failed', 'charge.failed'}:
                if checkout.status not in {PaymentCheckoutSession.STATUS_SUCCEEDED, PaymentCheckoutSession.STATUS_CANCELED}:
                    checkout.transition(PaymentCheckoutSession.STATUS_FAILED)
                    checkout.provider_session_id = checkout.provider_session_id or provider_session_id or None
                    checkout.save(update_fields=['status', 'provider_session_id', 'updated_at'])

        webhook_event.processed_at = timezone.now()
        webhook_event.save(update_fields=['processed_at'])

        SecurityAuditEvent.objects.create(
            event_type='payment.webhook.accepted',
            severity='info',
            ip_address=_client_ip(request),
            details={'event_id': event_id, 'event_type': event_type, 'checkout_reference': reference},
        )

    return Response({'status': 'ok'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([BurstRateThrottle])
def create_payment_view(request):
    """Create a PayU payment record and return checkout payload."""
    if not bool(getattr(settings, 'PURCHASES_ENABLED', False)):
        return Response(
            {'error': 'Purchases are temporarily unavailable while we complete payment maintenance.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    amount = request.data.get('amount')
    currency = (request.data.get('currency') or 'cop').strip().lower()
    payment_type = (request.data.get('type') or '').strip().lower()

    if payment_type not in {Payment.TYPE_DONATION, Payment.TYPE_SUBSCRIPTION, Payment.TYPE_PRODUCT}:
        return Response({'error': 'Invalid payment type.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount_value = Decimal(str(amount))
    except (TypeError, ValueError, InvalidOperation):
        return Response({'error': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

    if amount_value <= 0:
        return Response({'error': 'Amount must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

    tx_ref = str(uuid.uuid4())
    payment = Payment.objects.create(
        user=request.user,
        amount=amount_value,
        currency=currency,
        type=payment_type,
        status=Payment.STATUS_PENDING,
        payu_transaction_id=tx_ref,
    )

    return Response(
        {
            'payment_id': payment.id,
            'payu_transaction_id': tx_ref,
            'status': payment.status,
            'amount': str(payment.amount),
            'currency': payment.currency,
            'type': payment.type,
            'payu': {
                'merchant_id': getattr(settings, 'PAYU_MERCHANT_ID', ''),
                'account_id': getattr(settings, 'PAYU_ACCOUNT_ID', ''),
                'reference_code': tx_ref,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def payu_webhook_view(request):
    """Update payment statuses from PayU IPN webhooks."""
    try:
        payload = json.loads((request.body or b'{}').decode('utf-8'))
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON payload.'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = getattr(settings, 'PAYU_API_KEY', '').strip()
    merchant_id = getattr(settings, 'PAYU_MERCHANT_ID', '').strip()

    verified, error_message = _verify_payu_signature(payload, api_key, merchant_id)
    if not verified:
        SecurityAuditEvent.objects.create(
            event_type='payment.payu_webhook.rejected',
            severity='warning',
            ip_address=_client_ip(request),
            details={'reason': error_message},
        )
        return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)

    tx_ref = str(payload.get('reference_sale') or payload.get('referenceCode') or '').strip()
    state = str(payload.get('state_pol') or payload.get('state') or '').strip().lower()

    if not tx_ref:
        return Response({'error': 'Missing transaction reference.'}, status=status.HTTP_400_BAD_REQUEST)

    payment = Payment.objects.filter(payu_transaction_id=tx_ref).first()
    if not payment:
        return Response({'status': 'ignored'}, status=status.HTTP_200_OK)

    if state in {'4', 'approved', 'succeeded'}:
        payment.status = Payment.STATUS_SUCCEEDED
    elif state in {'6', 'declined', 'failed'}:
        payment.status = Payment.STATUS_FAILED
    elif state in {'5', 'canceled'}:
        payment.status = Payment.STATUS_CANCELED
    else:
        payment.status = Payment.STATUS_PENDING

    payment.save(update_fields=['status'])

    SecurityAuditEvent.objects.create(
        event_type='payment.payu_webhook.accepted',
        severity='info',
        ip_address=_client_ip(request),
        details={'tx_ref': tx_ref, 'state': state, 'payment_id': payment.id},
    )

    return Response({'status': 'ok', 'payment_id': payment.id, 'payment_status': payment.status})

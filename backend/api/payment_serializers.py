from django.conf import settings
from rest_framework import serializers


class CreateCheckoutSessionSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=['membership', 'product', 'donation'])
    item_id = serializers.CharField(max_length=100)
    amount_cents = serializers.IntegerField(min_value=1)
    currency = serializers.CharField(max_length=10, default='usd')
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
    metadata = serializers.DictField(required=False, default=dict)
    idempotency_key = serializers.CharField(required=False, max_length=120)

    def validate_item_id(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('item_id is required.')
        return value

    def validate_amount_cents(self, value):
        min_amount = int(getattr(settings, 'PAYMENT_MIN_AMOUNT_CENTS', 100))
        max_amount = int(getattr(settings, 'PAYMENT_MAX_AMOUNT_CENTS', 5_000_000))
        if value < min_amount or value > max_amount:
            raise serializers.ValidationError(f'Amount must be between {min_amount} and {max_amount} cents.')
        return value

    def validate_currency(self, value):
        value = value.strip().lower()
        if len(value) < 3:
            raise serializers.ValidationError('Invalid currency code.')
        return value

    def validate(self, attrs):
        is_debug = bool(getattr(settings, 'DEBUG', False))

        for key in ['success_url', 'cancel_url']:
            url = attrs.get(key, '')
            if not is_debug and not url.startswith('https://'):
                raise serializers.ValidationError({key: 'Only HTTPS callback URLs are allowed in production.'})

        return attrs

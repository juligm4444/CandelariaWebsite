import re

from rest_framework import serializers


SUSPICIOUS_INPUT_PATTERN = re.compile(
    r"(<\s*/?\s*script\b)|"
    r"(javascript\s*:)|"
    r"(<\s*iframe\b)|"
    r"(<\s*object\b)|"
    r"(<\s*embed\b)|"
    r"(on[a-z]+\s*=)",
    re.IGNORECASE,
)


def reject_suspicious_text(value, field_name):
    if not isinstance(value, str):
        return value

    if SUSPICIOUS_INPUT_PATTERN.search(value):
        raise serializers.ValidationError(
            f"Potentially unsafe content detected in {field_name}."
        )

    return value

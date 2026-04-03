from django.http import JsonResponse


class ApiSecurityHeadersMiddleware:
    """Attach security-focused headers to API responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path.startswith('/api/'):
            response.setdefault('X-Content-Type-Options', 'nosniff')
            response.setdefault('X-Frame-Options', 'DENY')
            response.setdefault('Referrer-Policy', 'no-referrer')
            response.setdefault('Content-Security-Policy', "frame-ancestors 'none'")
            response.setdefault('Cache-Control', 'no-store')

        return response


class ApiContentTypeGuardMiddleware:
    """Reject unsupported request content types for API write operations."""

    ALLOWED_PREFIXES = (
        'application/json',
        'multipart/form-data',
        'application/x-www-form-urlencoded',
        'application/json-patch+json',
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/') and request.method in {'POST', 'PUT', 'PATCH'}:
            content_type = (request.META.get('CONTENT_TYPE') or '').lower()
            has_body = request.META.get('CONTENT_LENGTH') not in {None, '', '0'}

            if has_body and content_type and not content_type.startswith(self.ALLOWED_PREFIXES):
                return JsonResponse({'error': 'Unsupported media type.'}, status=415)

        return self.get_response(request)

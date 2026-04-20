# Authentication API Views

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q

from .models import Member, UserProfile, TeamLeaderRequest, Team
from .security_logging import get_client_ip, log_team_leader_event
from .auth_serializers import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)
from .throttles import AuthRateThrottle


def _get_member_from_request_user(request):
    try:
        return Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return None


def _get_profile_for_user(user):
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'email': (user.email or user.username or '').strip().lower(),
            'name': (user.first_name or user.username or '').strip(),
            'is_internal': False,
            'internal_role': None,
        },
    )
    return profile


def _build_auth_user_payload(user, language='en'):
    profile = None
    fallback_profile = {
        'id': None,
        'email': (user.email or user.username or '').strip().lower(),
        'name': (f'{user.first_name} {user.last_name}'.strip() or user.username or '').strip(),
        'is_internal': False,
        'internal_role': None,
        'created_at': None,
    }

    try:
        profile = _get_profile_for_user(user)
    except Exception:
        # Legacy databases may have a drifted `profiles` schema.
        # Auth should still work using the Django auth user as source of truth.
        profile = None

    profile_data = {
        'id': getattr(profile, 'id', fallback_profile['id']),
        'email': getattr(profile, 'email', fallback_profile['email']),
        'name': getattr(profile, 'name', fallback_profile['name']),
        'is_internal': bool(getattr(profile, 'is_internal', fallback_profile['is_internal'])),
        'internal_role': getattr(profile, 'internal_role', fallback_profile['internal_role']),
        'created_at': getattr(profile, 'created_at', fallback_profile['created_at']),
    }

    try:
        member = Member.objects.get(user=user)
    except Member.DoesNotExist:
        member = None

    if member and profile is None:
        profile_data['is_internal'] = True
        if member.is_team_leader:
            profile_data['internal_role'] = 'leader'
        elif member.is_coleader:
            profile_data['internal_role'] = 'coleader'
        else:
            profile_data['internal_role'] = 'member'

    if member:
        payload = member.to_dict(language=language, include_email=True)
    else:
        payload = {
            'id': None,
            'email': profile_data['email'],
            'name': profile_data['name'],
            'career': '',
            'role': '',
            'image': None,
            'team_id': None,
            'team_name': None,
            'is_team_leader': False,
            'is_coleader': False,
            'created_at': profile_data['created_at'].isoformat() if profile_data['created_at'] else None,
            'social_links': [],
        }

    payload['user_id'] = user.id
    payload['profile_id'] = profile_data['id']
    payload['is_internal'] = profile_data['is_internal']
    payload['internal_role'] = profile_data['internal_role']
    payload['is_external'] = not profile_data['is_internal']
    return payload


def _client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR') or ''


def _attempt_key(email, ip):
    return f'auth:attempts:{ip}:{email}'


def _find_auth_user(identifier):
    normalized = (identifier or '').strip().lower()
    if not normalized:
        return None

    return User.objects.filter(
        Q(username__iexact=normalized) | Q(email__iexact=normalized)
    ).first()


def _is_login_locked(email, ip):
    attempts = int(cache.get(_attempt_key(email, ip), 0))
    return attempts >= int(getattr(settings, 'AUTH_MAX_ATTEMPTS', 8))


def _register_failed_attempt(email, ip):
    key = _attempt_key(email, ip)
    timeout = int(getattr(settings, 'AUTH_ATTEMPT_WINDOW_SECONDS', 900))
    current = cache.get(key)
    if current is None:
        cache.set(key, 1, timeout=timeout)
    else:
        try:
            cache.incr(key)
        except ValueError:
            cache.set(key, int(current) + 1, timeout=timeout)


def _clear_failed_attempts(email, ip):
    cache.delete(_attempt_key(email, ip))


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_view(request):
    """Secure registration with team leader request system"""
    try:
        data = request.data
        email = data.get('email', '').lower().strip()
        password = data.get('password')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        requested_team_id = data.get('team_id')  # Optional team leadership request
        
        # Get client information for security logging
        client_ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Validation
        if not all([email, password, first_name, last_name]):
            log_team_leader_event('registration_failed', email, 'N/A', client_ip, 
                                'Missing required fields')
            return Response({
                'error': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            log_team_leader_event('registration_failed', email, 'N/A', client_ip, 
                                'Email already exists')
            return Response({
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Django User (always as regular user first)
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )

        # Create UserProfile
        profile = _get_profile_for_user(user)

        # Create regular member (no auto team leadership)
        member = Member.objects.create(
            user=user,
            first_name=first_name,
            last_name=last_name,
            is_team_leader=False,  # Always start as regular member
            is_active=True,
            career_en="Member",
            career_es="Miembro",
            role_en="Team Member",
            role_es="Miembro del Equipo",
            charge_en="Contributing Member",
            charge_es="Miembro Contribuyente"
        )

        # If team leadership is requested, create secure request
        leadership_request_created = False
        if requested_team_id and settings.TEAM_LEADER_WHITELIST_ENABLED:
            try:
                requested_team = Team.objects.get(id=requested_team_id)
                
                # Create team leader request for verification
                team_request = TeamLeaderRequest.objects.create(
                    email=email,
                    requested_team=requested_team,
                    first_name=first_name,
                    last_name=last_name,
                    ip_address=client_ip,
                    user_agent=user_agent
                )
                
                # Verify against whitelist (auto-assigns if whitelisted)
                if team_request.verify_whitelist():
                    leadership_request_created = True
                    log_team_leader_event('auto_approved', email, requested_team.name_en, 
                                        client_ip, 'Email verified and team leadership auto-assigned')
                else:
                    # Not whitelisted - log potential security issue
                    log_team_leader_event('security_violation', email, requested_team.name_en, 
                                        client_ip, 'Non-whitelisted email attempted team leadership')
                    
            except Team.DoesNotExist:
                log_team_leader_event('request_failed', email, f'Team ID {requested_team_id}', 
                                    client_ip, 'Invalid team ID provided')

        # Log successful registration
        log_team_leader_event('registration_success', email, 
                            requested_team.name_en if requested_team_id else 'N/A', 
                            client_ip, f'Leadership request: {leadership_request_created}')

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        refresh['is_internal'] = bool(profile.is_internal)
        refresh['internal_role'] = profile.internal_role

        member_data = _build_auth_user_payload(user)
        refresh['member_id'] = member_data.get('id')
        refresh['email'] = member_data.get('email')
        refresh['is_team_leader'] = bool(member_data.get('is_team_leader'))
        refresh['is_coleader'] = bool(member_data.get('is_coleader'))
        
        response_data = {
            'message': 'Registration successful',
            'member': member_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
        
        # Only mention leadership if it was auto-assigned
        if leadership_request_created:
            response_data['leadership_status'] = 'Team leadership automatically assigned'
            
            # Refresh member data to include new team leader status
            member_data = _build_auth_user_payload(user)
            response_data['member'] = member_data
            
            # Update JWT tokens with new leadership status
            refresh['member_id'] = member_data.get('id')
            refresh['email'] = member_data.get('email')
            refresh['is_team_leader'] = bool(member_data.get('is_team_leader'))
            refresh['is_coleader'] = bool(member_data.get('is_coleader'))
            
            response_data['tokens'] = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Log registration errors for security monitoring
        log_team_leader_event('error', email if 'email' in locals() else 'unknown', 
                            'N/A', client_ip if 'client_ip' in locals() else 'unknown', 
                            f'Registration error: {str(e)}')
        return Response({
            'error': 'Registration failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower()
    password = serializer.validated_data['password']
    ip = _client_ip(request)

    if _is_login_locked(email, ip):
        return Response({
            'error': 'Too many failed attempts. Please wait and try again.',
            'code': 'too_many_attempts',
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)

    user = _find_auth_user(email)
    if user is None:
        _register_failed_attempt(email, ip)
        return Response({
            'error': 'Email is not registered.',
            'code': 'email_not_registered',
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        _register_failed_attempt(email, ip)
        return Response({
            'error': 'This account is inactive. Contact support.',
            'code': 'account_inactive',
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        _register_failed_attempt(email, ip)
        return Response({
            'error': 'Incorrect password.',
            'code': 'incorrect_password',
        }, status=status.HTTP_401_UNAUTHORIZED)

    _clear_failed_attempts(email, ip)

    member_payload = _build_auth_user_payload(user)

    refresh = RefreshToken.for_user(user)
    refresh['member_id'] = member_payload.get('id')
    refresh['email'] = member_payload.get('email')
    refresh['is_team_leader'] = bool(member_payload.get('is_team_leader'))
    refresh['is_coleader'] = bool(member_payload.get('is_coleader'))
    refresh['is_internal'] = bool(member_payload.get('is_internal'))
    refresh['internal_role'] = member_payload.get('internal_role')

    return Response({
        'message': 'Login successful',
        'member': member_payload,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'error': 'Invalid token or token already blacklisted'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    payload = _build_auth_user_payload(request.user)
    return Response({'member': payload}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update name for external (non-internal) users via their UserProfile."""
    profile = _get_profile_for_user(request.user)
    if profile.is_internal:
        return Response(
            {'error': 'Internal members must update their profile via the members endpoint.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    name = request.data.get('name', '').strip()
    if not name:
        return Response({'error': 'name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    profile.name = name
    profile.save(update_fields=['name'])
    request.user.first_name = name
    request.user.save(update_fields=['first_name'])
    payload = _build_auth_user_payload(request.user)
    return Response({'member': payload}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthRateThrottle])
def change_password_view(request):
    member = _get_member_from_request_user(request)

    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request, 'member': member}
    )

    if serializer.is_valid():
        new_password = serializer.validated_data['new_password']

        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])

        if member:
            member.set_password(new_password)
            member.save(update_fields=['password_hash'])

        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def forgot_password_view(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = _find_auth_user(email)
    if user is None or not user.is_active:
        return Response({'message': 'If this email is registered, a reset email has been sent.'})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_base}/reset-password?uid={uid}&token={token}"

    send_mail(
        subject='Candelaria Password Reset',
        message=(
            'You requested a password reset for your Candelaria account.\n\n'
            f'Open this link to set a new password:\n{reset_url}\n\n'
            'If you did not request this, you can ignore this email.'
        ),
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@candelaria.local'),
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({'message': 'If this email is registered, a reset email has been sent.'})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def reset_password_view(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not uid or not token or not new_password:
        return Response(
            {'error': 'uid, token, and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=['password'])

    try:
        member = Member.objects.get(user=user)
        member.set_password(new_password)
        member.save(update_fields=['password_hash'])
    except Member.DoesNotExist:
        pass

    return Response({'message': 'Password reset successful'})


@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def check_email_view(request):
    from .email_whitelist import get_email_whitelist_role
    from .team_leader_utils import get_team_leader_info

    email = request.query_params.get('email', '').strip().lower()

    if not email:
        return Response({'error': 'Email parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    whitelist_role = get_email_whitelist_role(email)
    team_leader_info = get_team_leader_info(email)

    is_whitelisted = whitelist_role is not None
    is_taken = Member.objects.filter(email=email).exists() or User.objects.filter(username=email).exists()

    return Response({
        'email': email,
        'is_whitelisted': is_whitelisted,
        'is_allowed': True,
        'whitelist_role': whitelist_role,
        'can_edit_role': whitelist_role in [None, 'members'],
        'is_taken': is_taken,
        'can_register': not is_taken,
        # Team leader specific info
        'is_team_leader_whitelist': team_leader_info['is_team_leader'],
        'whitelist_team_key': team_leader_info['team_key'],
        'whitelist_team_id': team_leader_info['team']['id'] if team_leader_info['team'] else None,
    }, status=status.HTTP_200_OK)

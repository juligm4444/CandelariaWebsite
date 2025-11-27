# Authentication API Views

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password

from .models import Member
from .auth_serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberInfoSerializer,
    ChangePasswordSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new member
    
    POST /api/auth/register/
    Body: {
        "email": "member@example.com",
        "password": "securepassword123",
        "name_en": "John Doe",
        "name_es": "Juan Pérez",
        "team_id": 1,
        "career": "Computer Science",
        "role": "Developer",
        "charge": "Backend"
    }
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        member = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = member.id
        refresh['email'] = member.email
        refresh['is_team_leader'] = member.is_team_leader
        
        return Response({
            'message': 'Registration successful',
            'member': member.to_dict(include_email=True),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login a member
    
    POST /api/auth/login/
    Body: {
        "email": "member@example.com",
        "password": "securepassword123"
    }
    """
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email'].lower()
    password = serializer.validated_data['password']
    
    # Find member by email
    try:
        member = Member.objects.get(email=email)
    except Member.DoesNotExist:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if account is active
    if not member.is_active:
        return Response({
            'error': 'Account is inactive. Please contact an administrator.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Verify password
    if not member.check_password(password):
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Generate JWT tokens
    refresh = RefreshToken()
    refresh['user_id'] = member.id
    refresh['email'] = member.email
    refresh['is_team_leader'] = member.is_team_leader
    
    return Response({
        'message': 'Login successful',
        'member': member.to_dict(include_email=True),
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout a member (blacklist refresh token)
    
    POST /api/auth/logout/
    Headers: Authorization: Bearer <access_token>
    Body: {
        "refresh": "<refresh_token>"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Invalid token or token already blacklisted'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated member info
    
    GET /api/auth/me/
    Headers: Authorization: Bearer <access_token>
    """
    # Get member ID from JWT token
    member_id = request.auth.payload.get('user_id')
    
    try:
        member = Member.objects.get(id=member_id)
        return Response({
            'member': member.to_dict(include_email=True)
        }, status=status.HTTP_200_OK)
    
    except Member.DoesNotExist:
        return Response({
            'error': 'Member not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change member password
    
    PUT /api/auth/change-password/
    Headers: Authorization: Bearer <access_token>
    Body: {
        "old_password": "oldpassword123",
        "new_password": "newpassword456"
    }
    """
    member_id = request.auth.payload.get('user_id')
    
    try:
        member = Member.objects.get(id=member_id)
    except Member.DoesNotExist:
        return Response({
            'error': 'Member not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request, 'member': member}
    )
    
    if serializer.is_valid():
        # Set new password
        member.set_password(serializer.validated_data['new_password'])
        member.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email_view(request):
    """
    Check if email is in whitelist (for frontend validation)
    
    GET /api/auth/check-email/?email=test@example.com
    """
    from .email_whitelist import is_email_allowed
    
    email = request.query_params.get('email', '').strip().lower()
    
    if not email:
        return Response({
            'error': 'Email parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    is_allowed = is_email_allowed(email)
    is_taken = Member.objects.filter(email=email).exists()
    
    return Response({
        'email': email,
        'is_allowed': is_allowed,
        'is_taken': is_taken,
        'can_register': is_allowed and not is_taken
    }, status=status.HTTP_200_OK)

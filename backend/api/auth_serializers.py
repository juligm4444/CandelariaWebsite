# Authentication API Serializers

from rest_framework import serializers
from .models import Member
from .email_whitelist import is_email_allowed


class RegisterSerializer(serializers.Serializer):
    """Serializer for member registration"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    name_en = serializers.CharField(required=True, max_length=100)
    name_es = serializers.CharField(required=True, max_length=100)
    team_id = serializers.IntegerField(required=True)
    career = serializers.CharField(required=False, max_length=100, allow_blank=True)
    role = serializers.CharField(required=False, max_length=50, allow_blank=True)
    charge = serializers.CharField(required=False, max_length=50, allow_blank=True)
    image_url = serializers.URLField(required=False, allow_blank=True)
    
    def validate_email(self, value):
        """Check if email is in whitelist and not already registered"""
        # Check whitelist
        if not is_email_allowed(value):
            raise serializers.ValidationError(
                "This email is not authorized to register. Please contact an administrator."
            )
        
        # Check if email already exists
        if Member.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A member with this email already exists.")
        
        return value.lower()
    
    def validate_team_id(self, value):
        """Check if team exists"""
        from .models import Team
        if not Team.objects.filter(id=value).exists():
            raise serializers.ValidationError("Team does not exist.")
        return value
    
    def create(self, validated_data):
        """Create new member with hashed password"""
        password = validated_data.pop('password')
        
        # Create member instance
        member = Member(**validated_data)
        member.set_password(password)  # Hash password with bcrypt
        member.is_active = True  # Activate account immediately
        member.save()
        
        return member


class LoginSerializer(serializers.Serializer):
    """Serializer for member login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class MemberInfoSerializer(serializers.Serializer):
    """Serializer for returning member information (excluding sensitive data)"""
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    name_en = serializers.CharField(read_only=True)
    name_es = serializers.CharField(read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    career = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    charge = serializers.CharField(read_only=True)
    image_url = serializers.URLField(read_only=True)
    is_team_leader = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    def validate_old_password(self, value):
        """Check if old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

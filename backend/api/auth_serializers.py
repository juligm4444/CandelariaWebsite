# Authentication API Serializers

from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Member, Team, UserProfile, InternalWhitelistEntry, TeamLeaderWhitelist
from .member_catalog import get_career_pair, resolve_role_pair
from .security import reject_suspicious_text



class RegisterSerializer(serializers.Serializer):
    """Serializer for registration supporting internal and public users."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    full_name = serializers.CharField(required=True, max_length=200)

    # Internal-only fields
    team_id = serializers.IntegerField(required=False)
    career_key = serializers.CharField(required=False, max_length=100)
    role = serializers.CharField(required=False, max_length=100, allow_blank=True)
    language = serializers.ChoiceField(required=False, choices=['en', 'es'], default='en')
    image = serializers.ImageField(required=False, allow_null=True)

    def validate_email(self, value):
        email = value.lower()
        if Member.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_team_id(self, value):
        if value is not None and not Team.objects.filter(id=value).exists():
            raise serializers.ValidationError("Team does not exist.")
        return value

    def validate_career_key(self, value):
        if value and not get_career_pair(value):
            raise serializers.ValidationError("Invalid career selection.")
        return value

    def validate_full_name(self, value):
        reject_suspicious_text(value, 'full_name')
        return value.strip()

    def validate_role(self, value):
        reject_suspicious_text(value, 'role')
        return value.strip()

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        internal_role, team_leader_entry = self._resolve_whitelist_role(email)

        # If this is a team leader from whitelist, auto-fill required fields
        if team_leader_entry:
            attrs['team_id'] = team_leader_entry.team.id
            attrs['career_key'] = 'design'  # Default career for leaders
            # Set a default role for team leaders
            attrs['role'] = 'Team Leader'

        if internal_role is None:
            return attrs

        team_id = attrs.get('team_id')
        career_key = attrs.get('career_key')
        image = attrs.get('image')
        errors = {}

        if not team_id:
            errors['team_id'] = 'Team is required for internal members.'

        if not career_key:
            errors['career_key'] = 'Career is required for internal members.'

        # Don't require image for team leaders from whitelist
        if not image and not team_leader_entry:
            errors['image'] = 'Profile image is required for internal members.'

        if errors:
            raise serializers.ValidationError(errors)

        if internal_role == UserProfile.ROLE_LEADER and Member.objects.filter(team_id=team_id, is_team_leader=True, is_active=True).exists():
            raise serializers.ValidationError({'team_id': 'This team already has an active leader.'})

        if internal_role == UserProfile.ROLE_COLEADER and Member.objects.filter(team_id=team_id, is_coleader=True, is_active=True).exists():
            raise serializers.ValidationError({'team_id': 'This team already has an active co-leader.'})

        return attrs

    def _resolve_whitelist_role(self, email):
        # First check team leader whitelist
        team_leader_entry = TeamLeaderWhitelist.objects.filter(email=email, is_active=True).first()
        if team_leader_entry:
            return UserProfile.ROLE_LEADER, team_leader_entry
        
        # Then check internal whitelist 
        db_entry = InternalWhitelistEntry.objects.filter(email=email).first()
        if db_entry:
            return db_entry.internal_role, None
        
        return None, None

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name').strip()
        language = validated_data.pop('language', 'en')
        email = validated_data.pop('email').lower()

        team_id = validated_data.pop('team_id', None)
        career_key = validated_data.pop('career_key', None)
        role = (validated_data.pop('role', '') or '').strip()
        image = validated_data.pop('image', None)

        internal_role, team_leader_entry = self._resolve_whitelist_role(email)
        is_internal = internal_role is not None

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name,
            last_name='',
            is_active=True,
        )

        profile = UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'email': email,
                'name': full_name,
                'is_internal': is_internal,
                'internal_role': internal_role,
            },
        )[0]

        member = None
        if is_internal:
            career_pair = get_career_pair(career_key)

            if internal_role == UserProfile.ROLE_LEADER:
                role_pair = {'role_en': 'Team Leader', 'role_es': 'Lider de Equipo'}
            elif internal_role == UserProfile.ROLE_COLEADER:
                role_pair = {'role_en': 'Co-Leader', 'role_es': 'Co-Lider'}
            else:
                role_pair = resolve_role_pair(role or 'Member', language)

            team = Team.objects.get(id=team_id)

            member = Member(
                user=user,
                name=full_name,
                email=email,
                career_en=career_pair['en'],
                career_es=career_pair['es'],
                role_en=role_pair['role_en'],
                role_es=role_pair['role_es'],
                image=image,
                team=team,
                is_team_leader=internal_role == UserProfile.ROLE_LEADER,
                is_coleader=internal_role == UserProfile.ROLE_COLEADER,
                is_active=True,
            )
            member.set_password(password)
            member.save()

            # If this was a team leader from whitelist, mark as used
            if team_leader_entry:
                team_leader_entry.is_active = False
                team_leader_entry.save()
                print(f"✅ Team Leader registered: {email} for team {team.name_en}")
        
        return {'user': user, 'profile': profile, 'member': member}

        return {
            'user': user,
            'profile': profile,
            'member': member,
        }


class LoginSerializer(serializers.Serializer):
    """Serializer for member login"""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class MemberInfoSerializer(serializers.Serializer):
    """Serializer for returning member information (excluding sensitive data)"""

    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    name = serializers.CharField(read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    career = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    image = serializers.CharField(read_only=True)
    is_team_leader = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

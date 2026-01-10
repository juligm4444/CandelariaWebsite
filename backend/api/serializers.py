from rest_framework import serializers
from .models import Team, Member, Publication, RedSocial


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    class Meta:
        model = Team
        fields = ['id', 'name_en', 'name_es']


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'name', 'career_en', 'career_es', 'role_en', 'role_es',
            'charge_en', 'charge_es', 'image_url', 'team', 'team_name_en', 'team_name_es',
            'email', 'is_team_leader', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'email': {'write_only': True}  # Don't expose email in public API
        }


class PublicationSerializer(serializers.ModelSerializer):
    """Serializer for Publication model"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True, allow_null=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True, allow_null=True)
    
    class Meta:
        model = Publication
        fields = [
            'id', 'title_en', 'title_es', 'content_en', 'content_es',
            'publication_date', 'image_url', 'team', 'team_name_en', 'team_name_es'
        ]


class RedSocialSerializer(serializers.ModelSerializer):
    """Serializer for RedSocial model"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    
    class Meta:
        model = RedSocial
        fields = ['id', 'link', 'icon_url', 'member', 'member_name']

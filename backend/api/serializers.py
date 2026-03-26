from rest_framework import serializers
from .models import Team, Member, Publication, RedSocial


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model with image support"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name_en', 'name_es', 'image_url', 'image']
        extra_kwargs = {
            'image': {'write_only': True}  # Don't expose the file path directly
        }
    
    def get_image_url(self, obj):
        """Return the uploaded image URL if available, otherwise return image_url field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model with image support"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = [
            'id', 'name', 'career_en', 'career_es', 'role_en', 'role_es',
            'charge_en', 'charge_es', 'image_url', 'image', 'team', 'team_name_en', 'team_name_es',
            'email', 'is_team_leader', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'email': {'write_only': True},  # Don't expose email in public API
            'image': {'write_only': True}  # Don't expose the file path directly
        }
    
    def get_image_url(self, obj):
        """Return the uploaded image URL if available, otherwise return image_url field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url


class PublicationSerializer(serializers.ModelSerializer):
    """Serializer for Publication model with image support"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True, allow_null=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True, allow_null=True)
    author_name = serializers.CharField(source='author.name', read_only=True, allow_null=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            'id', 'title_en', 'title_es', 'content_en', 'content_es',
            'publication_date', 'image_url', 'image', 'team', 'team_name_en', 'team_name_es',
            'author', 'author_name', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'image': {'write_only': True}  # Don't expose the file path directly
        }
    
    def get_image_url(self, obj):
        """Return the uploaded image URL if available, otherwise return image_url field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url


class RedSocialSerializer(serializers.ModelSerializer):
    """Serializer for RedSocial model"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    
    class Meta:
        model = RedSocial
        fields = ['id', 'platform', 'url', 'member', 'member_name']

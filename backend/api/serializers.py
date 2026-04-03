from rest_framework import serializers
from .models import Team, Member, Publication, RedSocial
from .security import reject_suspicious_text


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model with image support"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name_en', 'name_es', 'image']
    
    def get_image(self, obj):
        """Return absolute uploaded image URL when available."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model with image support"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'name', 'career_en', 'career_es', 'role_en', 'role_es',
            'image', 'team', 'team_name_en', 'team_name_es',
            'email', 'is_team_leader', 'is_coleader', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'email': {'write_only': True},  # Don't expose email in public API
        }
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                data['image'] = request.build_absolute_uri(instance.image.url)
            else:
                data['image'] = instance.image.url
        else:
            data['image'] = None
        return data

    def validate_name(self, value):
        reject_suspicious_text(value, 'name')
        return value.strip()

    def validate_career_en(self, value):
        reject_suspicious_text(value, 'career_en')
        return value.strip()

    def validate_career_es(self, value):
        reject_suspicious_text(value, 'career_es')
        return value.strip()

    def validate_role_en(self, value):
        reject_suspicious_text(value, 'role_en')
        return value.strip()

    def validate_role_es(self, value):
        reject_suspicious_text(value, 'role_es')
        return value.strip()


class PublicationSerializer(serializers.ModelSerializer):
    """Serializer for Publication model with image support"""
    team_name_en = serializers.CharField(source='team.name_en', read_only=True, allow_null=True)
    team_name_es = serializers.CharField(source='team.name_es', read_only=True, allow_null=True)
    author_name = serializers.CharField(source='author.name', read_only=True, allow_null=True)
    image = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            'id', 'slug', 'name_en', 'name_es', 'abstract_en', 'abstract_es',
            'publication_date', 'file', 'image', 'team', 'team_name_en', 'team_name_es',
            'author', 'author_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def validate_file(self, value):
        if value and not str(value.name).lower().endswith('.pdf'):
            raise serializers.ValidationError('Only PDF files are allowed.')
        return value

    def validate_name_en(self, value):
        reject_suspicious_text(value, 'name_en')
        return value.strip()

    def validate_name_es(self, value):
        reject_suspicious_text(value, 'name_es')
        return value.strip()

    def validate_abstract_en(self, value):
        reject_suspicious_text(value, 'abstract_en')
        return value.strip()

    def validate_abstract_es(self, value):
        reject_suspicious_text(value, 'abstract_es')
        return value.strip()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not self.instance and not attrs.get('file'):
            raise serializers.ValidationError({'file': 'PDF file is required.'})
        return attrs

    def get_file(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_image(self, obj):
        """Return absolute uploaded image URL when available."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class RedSocialSerializer(serializers.ModelSerializer):
    """Serializer for RedSocial model"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    
    class Meta:
        model = RedSocial
        fields = ['id', 'platform', 'url', 'member', 'member_name']

    def validate_url(self, value):
        reject_suspicious_text(value, 'url')
        if not (value.startswith('https://') or value.startswith('http://')):
            raise serializers.ValidationError('URL must start with http:// or https://')
        return value.strip()

import json

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from django.db import transaction
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import Team, Member, Publication, RedSocial, InternalWhitelistEntry, UserProfile
from .member_catalog import get_career_pair, resolve_role_pair
from .email_whitelist import (
    add_email_to_whitelist_section,
    remove_email_from_whitelist,
    SECTION_LEADERS,
    SECTION_COLEADERS,
    SECTION_MEMBERS,
)
from .serializers import (
    TeamSerializer, MemberSerializer,
    PublicationSerializer, RedSocialSerializer
)
from .permissions import (
    IsTeamLeader,
    IsOwnerOrTeamLeader,
    IsPublicationAuthorOrTeamLeader,
    IsTeamLeaderOfSameTeam,
    IsRedSocialOwnerOrTeamLeader,
    ReadOnly
)
from .throttles import BurstRateThrottle


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for API results"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Team model
    GET /api/teams/ - List all teams (public)
    GET /api/teams/{id}/ - Get team details (public)
    POST /api/teams/ - Create new team (team leader only)
    PUT /api/teams/{id}/ - Update team (team leader only)
    DELETE /api/teams/{id}/ - Delete team (team leader only)
    GET /api/teams/{id}/members/ - Get all members of a team (public)
    """
    queryset = Team.objects.all().only('id', 'name_en', 'name_es', 'image')
    serializer_class = TeamSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        """
        Public read access, team leaders only for write operations
        """
        if self.action in ['list', 'retrieve', 'members']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsTeamLeader]
        return [permission() for permission in permission_classes]

    def list(self, request):
        """List all teams"""
        teams = self.get_queryset()
        data = [team.to_dict() for team in teams]
        return Response(data)

    def retrieve(self, request, pk=None):
        """Get a specific team"""
        team = self.get_object()
        return Response(team.to_dict())

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members of a specific team"""
        team = self.get_object()
        # Optimize with prefetch_related for social links
        members = team.members.prefetch_related('social_links').filter(user__isnull=False, is_active=True)
        language = request.query_params.get('lang', 'en')
        data = [member.to_dict(language) for member in members]
        return Response(data)


class MemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Member model
    GET /api/members/ - List all members (public)
    GET /api/members/{id}/ - Get member details (public)
    POST /api/members/ - Use /api/auth/register/ instead
    PUT /api/members/{id}/ - Update member (owner or team leader)
    DELETE /api/members/{id}/ - Delete member (team leader of same team)
    GET /api/members/{id}/social-links/ - Get member's social media links (public)
    """
    queryset = Member.objects.select_related('team').prefetch_related('social_links').filter(user__isnull=False)
    serializer_class = MemberSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        """
        Public read access
        Update: Owner or team leader
        Delete: Team leader of same team only
        Create: Disabled (use /api/auth/register/)
        """
        if self.action in ['list', 'retrieve', 'social_links']:
            permission_classes = [AllowAny]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsAuthenticated, IsOwnerOrTeamLeader]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, IsTeamLeaderOfSameTeam]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, IsTeamLeader]  # Or redirect to register
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        """List all members with optional language filter"""
        language = request.query_params.get('lang', 'en')
        team_id = request.query_params.get('team')
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        
        queryset = self.get_queryset()
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        
        data = [member.to_dict(language) for member in queryset]
        return Response(data)

    def create(self, request, *args, **kwargs):
        return Response(
            {'error': 'Direct member creation is disabled. Use /api/auth/register/ via invite flow.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def retrieve(self, request, pk=None):
        """Get a specific member with language support"""
        language = request.query_params.get('lang', 'en')
        member = self.get_object()
        return Response(member.to_dict(language))

    def partial_update(self, request, *args, **kwargs):
        """Update member profile fields and optionally replace social links list."""
        member = self.get_object()

        update_data = request.data.copy()
        language = (update_data.get('language') or request.query_params.get('lang') or 'en').lower()

        if 'full_name' in update_data:
            update_data['name'] = update_data.get('full_name', '').strip()
            update_data.pop('full_name', None)

        if 'career_key' in update_data:
            career_pair = get_career_pair(update_data.get('career_key'))
            if not career_pair:
                return Response({'error': 'Invalid career selection'}, status=status.HTTP_400_BAD_REQUEST)
            update_data['career_en'] = career_pair['en']
            update_data['career_es'] = career_pair['es']
            update_data.pop('career_key', None)

        if 'role' in update_data:
            if member.is_team_leader or member.is_coleader:
                return Response({'error': 'Leader and co-leader roles cannot be edited from profile.'}, status=status.HTTP_403_FORBIDDEN)
            role_pair = resolve_role_pair(update_data.get('role', ''), language)
            update_data['role_en'] = role_pair['role_en']
            update_data['role_es'] = role_pair['role_es']
            update_data.pop('role', None)

        update_data.pop('language', None)

        serializer = self.get_serializer(member, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        social_links_payload = request.data.get('social_links')
        if social_links_payload is not None:
            if isinstance(social_links_payload, str):
                try:
                    social_links_payload = json.loads(social_links_payload)
                except json.JSONDecodeError:
                    return Response(
                        {'error': 'social_links must be valid JSON'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            if not isinstance(social_links_payload, list):
                return Response(
                    {'error': 'social_links must be a list'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            existing = {link.platform: link for link in member.social_links.all()}
            submitted_platforms = set()

            for item in social_links_payload:
                platform = (item.get('platform') or '').strip().lower()
                url = (item.get('url') or '').strip()
                if not platform or not url:
                    continue

                submitted_platforms.add(platform)

                if platform in existing:
                    link = existing[platform]
                    if link.url != url:
                        link.url = url
                        link.save(update_fields=['url'])
                else:
                    RedSocial.objects.create(member=member, platform=platform, url=url)

            for platform, link in existing.items():
                if platform not in submitted_platforms:
                    link.delete()

        language = request.query_params.get('lang', language)
        member.refresh_from_db()
        return Response(member.to_dict(language, include_email=True), status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[BurstRateThrottle])
    def invite(self, request):
        actor = getattr(request.user, 'member_profile', None)
        if not actor or not actor.is_active:
            return Response({'error': 'Member profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not actor.is_team_leader and not actor.is_coleader:
            return Response({'error': 'Only leaders and co-leaders can invite members.'}, status=status.HTTP_403_FORBIDDEN)

        email = (request.data.get('email') or '').strip().lower()
        role = (request.data.get('role') or SECTION_MEMBERS).strip().lower()
        confirm = bool(request.data.get('confirm', False))

        if not confirm:
            return Response({'error': 'Action confirmation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Invalid email format.'}, status=status.HTTP_400_BAD_REQUEST)

        if actor.is_coleader and role != SECTION_MEMBERS:
            return Response({'error': 'Co-leaders can only invite normal members.'}, status=status.HTTP_403_FORBIDDEN)

        if role not in {SECTION_LEADERS, SECTION_COLEADERS, SECTION_MEMBERS}:
            return Response({'error': 'Invalid role section.'}, status=status.HTTP_400_BAD_REQUEST)

        added = add_email_to_whitelist_section(email, role)
        if not added and not InternalWhitelistEntry.objects.filter(email=email).exists():
            return Response({'error': 'Email is already in whitelist or invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        db_role = UserProfile.ROLE_MEMBER
        if role == SECTION_LEADERS:
            db_role = UserProfile.ROLE_LEADER
        elif role == SECTION_COLEADERS:
            db_role = UserProfile.ROLE_COLEADER

        InternalWhitelistEntry.objects.update_or_create(
            email=email,
            defaults={
                'internal_role': db_role,
                'invited_by': request.user,
            },
        )

        return Response({'message': 'Invitation added to whitelist.', 'email': email, 'role': role})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[BurstRateThrottle])
    def kick(self, request, pk=None):
        actor = getattr(request.user, 'member_profile', None)
        target = self.get_object()
        confirm = bool(request.data.get('confirm', False))

        if not confirm:
            return Response({'error': 'Action confirmation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not actor or actor.team_id != target.team_id:
            return Response({'error': 'Invalid team scope.'}, status=status.HTTP_403_FORBIDDEN)

        if actor.id == target.id:
            return Response({'error': 'You cannot kick yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if actor.is_coleader and (target.is_team_leader or target.is_coleader):
            return Response({'error': 'Co-leaders cannot remove leaders or co-leaders.'}, status=status.HTTP_403_FORBIDDEN)

        if not actor.is_team_leader and not actor.is_coleader:
            return Response({'error': 'You do not have permission to kick members.'}, status=status.HTTP_403_FORBIDDEN)

        target.is_active = False
        if target.user:
            target.user.is_active = False
            target.user.save(update_fields=['is_active'])
        target.save(update_fields=['is_active'])

        if target.email:
            remove_email_from_whitelist(target.email)

        return Response({'message': 'Member access revoked.', 'member_id': target.id})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[BurstRateThrottle])
    def transfer_leadership(self, request, pk=None):
        actor = getattr(request.user, 'member_profile', None)
        target = self.get_object()
        confirm = bool(request.data.get('confirm', False))

        if not confirm:
            return Response({'error': 'Action confirmation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not actor or not actor.is_team_leader:
            return Response({'error': 'Only team leaders can transfer leadership.'}, status=status.HTTP_403_FORBIDDEN)

        if actor.team_id != target.team_id:
            return Response({'error': 'Target member must belong to your team.'}, status=status.HTTP_400_BAD_REQUEST)

        if actor.id == target.id:
            return Response({'error': 'Leadership must be transferred to a different member.'}, status=status.HTTP_400_BAD_REQUEST)

        if not target.is_coleader:
            return Response({'error': 'Leadership can only be transferred to a co-leader.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            actor.is_team_leader = False
            actor.save(update_fields=['is_team_leader'])

            target.is_team_leader = True
            target.is_coleader = False
            target.role_en = 'Team Leader'
            target.role_es = 'Líder de Equipo'
            target.save(update_fields=['is_team_leader', 'is_coleader', 'role_en', 'role_es'])

        return Response({'message': 'Leadership transferred successfully. Reload session to refresh permissions.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[BurstRateThrottle])
    def transfer_coleadership(self, request, pk=None):
        actor = getattr(request.user, 'member_profile', None)
        target = self.get_object()
        confirm = bool(request.data.get('confirm', False))

        if not confirm:
            return Response({'error': 'Action confirmation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not actor or not actor.is_coleader:
            return Response({'error': 'Only a co-leader can transfer co-leadership.'}, status=status.HTTP_403_FORBIDDEN)

        if actor.team_id != target.team_id:
            return Response({'error': 'Target member must belong to your team.'}, status=status.HTTP_400_BAD_REQUEST)

        if actor.id == target.id:
            return Response({'error': 'Co-leadership must be transferred to a different member.'}, status=status.HTTP_400_BAD_REQUEST)

        if target.is_team_leader:
            return Response({'error': 'Leader cannot receive co-leadership.'}, status=status.HTTP_400_BAD_REQUEST)

        if Member.objects.filter(team_id=actor.team_id, is_coleader=True).exclude(pk=actor.pk).exists():
            return Response({'error': 'Team already has another active co-leader.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            actor.is_coleader = False
            actor.role_en = 'Member'
            actor.role_es = 'Miembro'
            actor.save(update_fields=['is_coleader', 'role_en', 'role_es'])

            target.is_coleader = True
            target.role_en = 'Co-Leader'
            target.role_es = 'Co-Líder'
            target.save(update_fields=['is_coleader', 'role_en', 'role_es'])

        return Response({'message': 'Co-leadership transferred successfully. Reload session to refresh permissions.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[BurstRateThrottle])
    def set_coleader(self, request, pk=None):
        actor = getattr(request.user, 'member_profile', None)
        target = self.get_object()
        confirm = bool(request.data.get('confirm', False))

        if not confirm:
            return Response({'error': 'Action confirmation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not actor or not actor.is_team_leader:
            return Response({'error': 'Only a leader can assign or remove co-leader.'}, status=status.HTTP_403_FORBIDDEN)

        if actor.team_id != target.team_id:
            return Response({'error': 'Target member must belong to your team.'}, status=status.HTTP_400_BAD_REQUEST)

        if target.is_team_leader:
            return Response({'error': 'Leader cannot be co-leader.'}, status=status.HTTP_400_BAD_REQUEST)

        should_set = bool(request.data.get('is_coleader', True))

        with transaction.atomic():
            if should_set:
                Member.objects.filter(team_id=target.team_id, is_coleader=True).exclude(pk=target.pk).update(is_coleader=False, role_en='Member', role_es='Miembro')
                target.is_coleader = True
                target.role_en = 'Co-Leader'
                target.role_es = 'Co-Líder'
                target.save(update_fields=['is_coleader', 'role_en', 'role_es'])
            else:
                target.is_coleader = False
                target.role_en = 'Member'
                target.role_es = 'Miembro'
                target.save(update_fields=['is_coleader', 'role_en', 'role_es'])

        return Response({'message': 'Co-leader status updated.', 'member_id': target.id, 'is_coleader': target.is_coleader})

    @action(detail=True, methods=['get'])
    def social_links(self, request, pk=None):
        """Get all social media links for a specific member"""
        member = self.get_object()
        links = member.social_links.all()
        data = [link.to_dict() for link in links]
        return Response(data)


class PublicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Publication model
    GET /api/publications/ - List all publications (public)
    GET /api/publications/{id}/ - Get publication details (public)
    POST /api/publications/ - Create new publication (authenticated members)
    PUT /api/publications/{id}/ - Update publication (author or team leader)
    DELETE /api/publications/{id}/ - Delete publication (author or team leader)
    """
    queryset = Publication.objects.select_related('team', 'author').all()
    serializer_class = PublicationSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'

    def get_permissions(self):
        """
        Public read access
        Create: Any authenticated member
        Update/Delete: Author or team leader of same team
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsPublicationAuthorOrTeamLeader]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        """List all publications with optional language and team filters"""
        language = request.query_params.get('lang', 'en')
        team_id = request.query_params.get('team')
        
        queryset = self.get_queryset()
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        
        data = [publication.to_dict(language) for publication in queryset]
        return Response(data)

    def retrieve(self, request, slug=None):
        """Get a specific publication with language support"""
        language = request.query_params.get('lang', 'en')
        publication = self.get_object()
        return Response(publication.to_dict(language))

    def create(self, request):
        """Create a new publication with automatic author assignment."""
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile or not profile.is_internal:
            return Response({'error': 'Only internal members can create publications.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            return Response({'error': 'Internal member profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['author'] = member.id

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RedSocialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RedSocial model
    GET /api/social-links/ - List all social media links (public)
    GET /api/social-links/{id}/ - Get social link details (public)
    POST /api/social-links/ - Create new social link (authenticated)
    PUT /api/social-links/{id}/ - Update social link (owner or team leader)
    DELETE /api/social-links/{id}/ - Delete social link (owner or team leader)
    """
    queryset = RedSocial.objects.all()
    serializer_class = RedSocialSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsRedSocialOwnerOrTeamLeader()]

    def list(self, request):
        """List all social links with optional member filter"""
        member_id = request.query_params.get('member')
        
        queryset = self.get_queryset()
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        data = [link.to_dict() for link in queryset]
        return Response(data)

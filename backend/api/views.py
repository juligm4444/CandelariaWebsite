from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Team, Member, Publication, RedSocial
from .serializers import (
    TeamSerializer, MemberSerializer,
    PublicationSerializer, RedSocialSerializer
)
from .permissions import (
    IsTeamLeader,
    IsOwnerOrTeamLeader,
    IsPublicationAuthorOrTeamLeader,
    IsTeamLeaderOfSameTeam,
    ReadOnly
)


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
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

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
        members = team.members.all()
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
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

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
        
        queryset = self.get_queryset()
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        
        data = [member.to_dict(language) for member in queryset]
        return Response(data)

    def retrieve(self, request, pk=None):
        """Get a specific member with language support"""
        language = request.query_params.get('lang', 'en')
        member = self.get_object()
        return Response(member.to_dict(language))

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
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer

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

    def retrieve(self, request, pk=None):
        """Get a specific publication with language support"""
        language = request.query_params.get('lang', 'en')
        publication = self.get_object()
        return Response(publication.to_dict(language))

    def create(self, request):
        """Create a new publication with automatic author assignment"""
        # Get member ID from JWT token
        member_id = request.auth.payload.get('user_id')
        
        # Add author_id to the request data
        data = request.data.copy()
        data['author_id'] = member_id
        
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
        """
        Public read access
        Create/Update/Delete: Authenticated members (own links or team leader)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def list(self, request):
        """List all social links with optional member filter"""
        member_id = request.query_params.get('member')
        
        queryset = self.get_queryset()
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        data = [link.to_dict() for link in queryset]
        return Response(data)

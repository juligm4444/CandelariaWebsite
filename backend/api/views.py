from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Team, Member, Admin, Publication, RedSocial
from .serializers import (
    TeamSerializer, MemberSerializer, AdminSerializer,
    PublicationSerializer, RedSocialSerializer
)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Team model
    GET /api/teams/ - List all teams
    GET /api/teams/{id}/ - Get team details
    POST /api/teams/ - Create new team
    PUT /api/teams/{id}/ - Update team
    DELETE /api/teams/{id}/ - Delete team
    GET /api/teams/{id}/members/ - Get all members of a team
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

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
    GET /api/members/ - List all members
    GET /api/members/{id}/ - Get member details
    POST /api/members/ - Create new member
    PUT /api/members/{id}/ - Update member
    DELETE /api/members/{id}/ - Delete member
    GET /api/members/{id}/social-links/ - Get member's social media links
    """
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

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


class AdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Admin model
    GET /api/admins/ - List all admins
    GET /api/admins/{id}/ - Get admin details
    POST /api/admins/ - Create new admin
    PUT /api/admins/{id}/ - Update admin
    DELETE /api/admins/{id}/ - Delete admin
    """
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer


class PublicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Publication model
    GET /api/publications/ - List all publications
    GET /api/publications/{id}/ - Get publication details
    POST /api/publications/ - Create new publication
    PUT /api/publications/{id}/ - Update publication
    DELETE /api/publications/{id}/ - Delete publication
    """
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer

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


class RedSocialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RedSocial model
    GET /api/social-links/ - List all social media links
    GET /api/social-links/{id}/ - Get social link details
    POST /api/social-links/ - Create new social link
    PUT /api/social-links/{id}/ - Update social link
    DELETE /api/social-links/{id}/ - Delete social link
    """
    queryset = RedSocial.objects.all()
    serializer_class = RedSocialSerializer

    def list(self, request):
        """List all social links with optional member filter"""
        member_id = request.query_params.get('member')
        
        queryset = self.get_queryset()
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        data = [link.to_dict() for link in queryset]
        return Response(data)

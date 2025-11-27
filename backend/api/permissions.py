# Custom Permission Classes for Authentication

from rest_framework import permissions


class IsTeamLeader(permissions.BasePermission):
    """
    Permission class to check if user is a team leader
    """
    message = 'You must be a team leader to perform this action.'
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.auth:
            return False
        
        # Get member from JWT token
        try:
            member_id = request.auth.payload.get('user_id')
            is_team_leader = request.auth.payload.get('is_team_leader', False)
            return is_team_leader
        except:
            return False


class IsOwnerOrTeamLeader(permissions.BasePermission):
    """
    Permission class to check if user is the owner of the object or a team leader
    """
    message = 'You must be the owner or a team leader to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.auth:
            return False
        
        try:
            member_id = request.auth.payload.get('user_id')
            is_team_leader = request.auth.payload.get('is_team_leader', False)
            
            # Team leaders can do anything
            if is_team_leader:
                return True
            
            # Check if user is the owner (for Member objects)
            if hasattr(obj, 'id') and obj.id == member_id:
                return True
            
            # Check if user is the author (for Publication objects)
            if hasattr(obj, 'author_id') and obj.author_id == member_id:
                return True
            
            return False
        except:
            return False


class IsPublicationAuthorOrTeamLeader(permissions.BasePermission):
    """
    Permission class specifically for publications
    - Author can edit/delete their own publications
    - Team leaders can edit/delete publications from their team
    """
    message = 'You must be the author or team leader of this publication to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.auth:
            return False
        
        try:
            from .models import Member
            
            member_id = request.auth.payload.get('user_id')
            is_team_leader = request.auth.payload.get('is_team_leader', False)
            
            # Check if user is the author
            if hasattr(obj, 'author_id') and obj.author_id == member_id:
                return True
            
            # If team leader, check if publication belongs to their team
            if is_team_leader:
                member = Member.objects.get(id=member_id)
                # Team leader can manage publications from their team
                if hasattr(obj, 'team_id') and obj.team_id == member.team_id:
                    return True
            
            return False
        except:
            return False


class IsSameTeam(permissions.BasePermission):
    """
    Permission class to check if user is in the same team as the object
    """
    message = 'You must be in the same team to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.auth:
            return False
        
        try:
            from .models import Member
            
            member_id = request.auth.payload.get('user_id')
            is_team_leader = request.auth.payload.get('is_team_leader', False)
            
            # Get current user's team
            member = Member.objects.get(id=member_id)
            
            # Check if object has team_id and it matches
            if hasattr(obj, 'team_id'):
                return obj.team_id == member.team_id
            
            return False
        except:
            return False


class IsTeamLeaderOfSameTeam(permissions.BasePermission):
    """
    Permission class to check if user is a team leader of the same team as the object
    Used for managing team members
    """
    message = 'You must be a team leader of this team to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.auth:
            return False
        
        try:
            from .models import Member
            
            member_id = request.auth.payload.get('user_id')
            is_team_leader = request.auth.payload.get('is_team_leader', False)
            
            # Must be a team leader
            if not is_team_leader:
                return False
            
            # Get current user's team
            member = Member.objects.get(id=member_id)
            
            # Check if object has team_id and it matches
            if hasattr(obj, 'team_id'):
                return obj.team_id == member.team_id
            
            return False
        except:
            return False


class ReadOnly(permissions.BasePermission):
    """
    Permission class that only allows read operations (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

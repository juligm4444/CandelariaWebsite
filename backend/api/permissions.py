# Custom Permission Classes for Authentication

from rest_framework import permissions


class IsTeamLeader(permissions.BasePermission):
    """
    Permission class to check if user is a team leader
    """
    message = 'You must be a team leader to perform this action.'
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return bool(getattr(request.user.member_profile, 'is_team_leader', False))
        except Exception:
            return False


class IsOwnerOrTeamLeader(permissions.BasePermission):
    """
    Permission class to check if user is the owner of the object or the team leader
    of the SAME team as the object being edited.
    """
    message = 'You must be the owner or a team leader of this team to perform this action.'

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            member = request.user.member_profile

            # Owner of the object (Member editing their own profile)
            if hasattr(obj, 'id') and obj.id == member.id:
                return True

            # Author of the object (Publication)
            if hasattr(obj, 'author_id') and obj.author_id == member.id:
                return True

            # Team leader — must be scoped to the same team
            if member.is_team_leader:
                obj_team_id = getattr(obj, 'team_id', None)
                if obj_team_id is not None:
                    return obj_team_id == member.team_id
                # For publications with a team FK that may be null, fall back to author team
                if hasattr(obj, 'author') and obj.author:
                    return obj.author.team_id == member.team_id

            return False
        except Exception:
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
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            member = request.user.member_profile

            # Check if user is the author
            if hasattr(obj, 'author_id') and obj.author_id == member.id:
                return True

            # If team leader, check if publication belongs to their team
            if member.is_team_leader and hasattr(obj, 'team_id') and obj.team_id == member.team_id:
                return True

            return False
        except Exception:
            return False


class IsSameTeam(permissions.BasePermission):
    """
    Permission class to check if user is in the same team as the object
    """
    message = 'You must be in the same team to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            member = request.user.member_profile

            # Check if object has team_id and it matches
            if hasattr(obj, 'team_id'):
                return obj.team_id == member.team_id

            return False
        except Exception:
            return False


class IsTeamLeaderOfSameTeam(permissions.BasePermission):
    """
    Permission class to check if user is a team leader of the same team as the object
    Used for managing team members
    """
    message = 'You must be a team leader of this team to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            member = request.user.member_profile

            # Must be a team leader
            if not member.is_team_leader:
                return False

            # Check if object has team_id and it matches
            if hasattr(obj, 'team_id'):
                return obj.team_id == member.team_id

            return False
        except Exception:
            return False


class IsRedSocialOwnerOrTeamLeader(permissions.BasePermission):
    """
    For RedSocial objects: allow the owning member or their team leader to write.
    """
    message = 'You must own this social link or be the team leader of this member.'

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            actor = request.user.member_profile
            # Owner
            if obj.member_id == actor.id:
                return True
            # Team leader of the same team
            if actor.is_team_leader and obj.member.team_id == actor.team_id:
                return True
            return False
        except Exception:
            return False

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class ReadOnly(permissions.BasePermission):
    """
    Permission class that only allows read operations (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

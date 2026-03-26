from django.contrib import admin
from .models import Team, Member, Publication, RedSocial


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_en', 'name_es']
    search_fields = ['name_en', 'name_es']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'role_en', 'team', 'is_team_leader', 'is_active']
    list_filter = ['team', 'is_team_leader', 'is_active']
    search_fields = ['name', 'email', 'role_en', 'role_es']
    list_editable = ['is_team_leader', 'is_active']
    fields = ['user', 'name', 'email', 'image', 'image_url', 'career_en', 'career_es', 
              'role_en', 'role_es', 'charge_en', 'charge_es', 'team', 
              'is_team_leader', 'is_active', 'password_hash']
    readonly_fields = ['password_hash']
    
    # Disable admin logging to avoid the ID sequence issue
    def log_addition(self, request, object, message):
        pass
    
    def log_change(self, request, object, message):
        pass
    
    def log_deletion(self, request, object, object_repr):
        pass
    
    def log_addition(self, request, object, message):
        """Disable logging to avoid constraint errors"""
        pass
    
    def log_change(self, request, object, message):
        """Disable logging to avoid constraint errors"""
        pass
    
    def log_deletion(self, request, object, object_repr):
        """Disable logging to avoid constraint errors"""
        pass


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_en', 'publication_date', 'team']
    list_filter = ['team', 'publication_date']
    search_fields = ['title_en', 'title_es']
    date_hierarchy = 'publication_date'


@admin.register(RedSocial)
class RedSocialAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'platform', 'url']
    list_filter = ['member', 'platform']
    search_fields = ['member__name', 'url', 'platform']

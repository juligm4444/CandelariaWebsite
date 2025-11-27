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


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_en', 'publication_date', 'team']
    list_filter = ['team', 'publication_date']
    search_fields = ['title_en', 'title_es']
    date_hierarchy = 'publication_date'


@admin.register(RedSocial)
class RedSocialAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'link']
    list_filter = ['member']
    search_fields = ['member__name', 'link']

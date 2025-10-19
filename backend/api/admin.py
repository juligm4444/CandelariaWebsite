from django.contrib import admin
from .models import Team, Member, Admin, Publication, RedSocial


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_en', 'name_es']
    search_fields = ['name_en', 'name_es']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'role_en', 'team']
    list_filter = ['team']
    search_fields = ['name', 'role_en', 'role_es']


@admin.register(Admin)
class AdminModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'member']
    search_fields = ['email', 'member__name']


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

#!/usr/bin/env python
"""Create or update the project superuser and linked Member profile."""

import os
import sys

import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'candelaria_project.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import transaction

from api.email_whitelist import add_email_to_whitelist, is_email_allowed
from api.member_catalog import get_career_pair, resolve_role_pair
from api.models import Member, Team


USERNAME = os.getenv('CANDELARIA_SUPERUSER_USERNAME', '').strip()
EMAIL = os.getenv('CANDELARIA_SUPERUSER_EMAIL', '').strip().lower()
PASSWORD = os.getenv('CANDELARIA_SUPERUSER_PASSWORD', '')
FULL_NAME = os.getenv('CANDELARIA_SUPERUSER_FULL_NAME', 'Candelaria Admin').strip()
CAREER_KEY = os.getenv('CANDELARIA_SUPERUSER_CAREER_KEY', 'design').strip().lower()
ROLE_INPUT = os.getenv('CANDELARIA_SUPERUSER_ROLE', 'Team Leader').strip()
ROLE_LANGUAGE = os.getenv('CANDELARIA_SUPERUSER_ROLE_LANGUAGE', 'en').strip().lower()
TEAM_HINT = os.getenv('CANDELARIA_SUPERUSER_TEAM_HINT', 'design').strip().lower()


def validate_required_credentials():
    missing = []
    if not USERNAME:
        missing.append('CANDELARIA_SUPERUSER_USERNAME')
    if not EMAIL:
        missing.append('CANDELARIA_SUPERUSER_EMAIL')
    if not PASSWORD:
        missing.append('CANDELARIA_SUPERUSER_PASSWORD')

    if missing:
        raise RuntimeError(
            f"Missing required environment variables for superuser creation: {', '.join(missing)}"
        )


def resolve_team_or_raise():
    """Resolve team robustly by id, then by English/Spanish name contains match."""
    if TEAM_HINT.isdigit():
        team = Team.objects.filter(id=int(TEAM_HINT)).first()
        if team:
            return team

    team = Team.objects.filter(name_en__icontains=TEAM_HINT).first()
    if team:
        return team

    team = Team.objects.filter(name_es__icontains=TEAM_HINT).first()
    if team:
        return team

    raise RuntimeError(
        f"Could not resolve team from TEAM_HINT='{TEAM_HINT}'. "
        "Set CANDELARIA_SUPERUSER_TEAM_HINT to a team id or name fragment."
    )


@transaction.atomic
def create_or_update_superuser_with_member():
    full_name_parts = FULL_NAME.split(' ', 1)
    first_name = full_name_parts[0]
    last_name = full_name_parts[1] if len(full_name_parts) > 1 else ''

    career_pair = get_career_pair(CAREER_KEY)
    if not career_pair:
        raise RuntimeError(
            f"Invalid CAREER_KEY='{CAREER_KEY}'. "
            "Use a valid career key from backend/api/member_catalog.py"
        )

    role_pair = resolve_role_pair(ROLE_INPUT, ROLE_LANGUAGE)
    team = resolve_team_or_raise()

    user, user_created = User.objects.get_or_create(
        username=USERNAME,
        defaults={
            'email': EMAIL,
            'first_name': first_name,
            'last_name': last_name,
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
    )

    user.email = EMAIL
    user.first_name = first_name
    user.last_name = last_name
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    if PASSWORD:
        user.set_password(PASSWORD)
    user.save()

    member = Member.objects.filter(user=user).first() or Member.objects.filter(email=EMAIL).first()
    if not member:
        member = Member(user=user, email=EMAIL)

    member.user = user
    member.name = FULL_NAME
    member.email = EMAIL
    member.team = team
    member.career_en = career_pair['en']
    member.career_es = career_pair['es']
    member.role_en = role_pair['role_en']
    member.role_es = role_pair['role_es']
    member.is_team_leader = True
    member.is_active = True
    if PASSWORD:
        member.set_password(PASSWORD)
    member.save()

    if not is_email_allowed(EMAIL):
        add_email_to_whitelist(EMAIL)

    print('\n' + '=' * 68)
    print('SUPERUSER + MEMBER UPSERT COMPLETE')
    print('=' * 68)
    print(f"User created:   {'yes' if user_created else 'no (updated)'}")
    print(f"Username:       {user.username}")
    print(f"Email:          {user.email}")
    print(f"Full Name:      {member.name}")
    print(f"Team:           {team.name_en} (id={team.id})")
    print(f"Career:         {member.career_en} / {member.career_es}")
    print(f"Role:           {member.role_en} / {member.role_es}")
    print(f"User ID:        {user.id}")
    print(f"Member ID:      {member.id}")
    print(f"Whitelisted:    {'yes' if is_email_allowed(EMAIL) else 'no'}")
    print('=' * 68)


if __name__ == '__main__':
    validate_required_credentials()
    create_or_update_superuser_with_member()

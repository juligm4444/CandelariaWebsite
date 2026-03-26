#!/usr/bin/env python
"""
Script to create a superuser with associated Member profile
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'candelaria_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Member, Team

def create_superuser_with_member():
    """Create superuser with member profile"""
    
    # Superuser data
    username = 'juligm4'
    email = 'j.galindom2@uniandes.edu.co'
    password = '44$admin$44'
    first_name = 'Julián'
    last_name = 'Galindo'
    
    # Member data
    career_en = 'Design'
    career_es = 'Diseño'
    role_en = 'Team Leader'
    role_es = 'Líder de Equipo'
    charge_en = 'Website & Prototyping'
    charge_es = 'Sitio Web y Prototipado'
    team_id = 7
    
    # Check if user already exists
    user_exists = User.objects.filter(username=username).exists()
    
    if user_exists:
        print(f"⚠️  User '{username}' already exists!")
        user = User.objects.get(username=username)
        print(f"   User ID: {user.id}")
        
        # Check if member profile exists
        try:
            member = user.member_profile
            print(f"   Member profile already exists (ID: {member.id})")
            print(f"\n✅ User and member already configured!")
            return
        except Member.DoesNotExist:
            print(f"   No member profile found. Creating one...")
    else:
        # Create new superuser
        print(f"\n🔨 Creating superuser '{username}'...")
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        print(f"✅ Superuser created successfully! (ID: {user.id})")
    
    # Get the team
    try:
        team = Team.objects.get(id=team_id)
        print(f"✓ Found team: {team.name_en}")
    except Team.DoesNotExist:
        print(f"❌ Team with ID {team_id} does not exist!")
        return
    
    # Create member profile
    print(f"\n🔨 Creating member profile...")
    member = Member.objects.create(
        user=user,
        name=f"{first_name} {last_name}",
        email=email,
        career_en=career_en,
        career_es=career_es,
        role_en=role_en,
        role_es=role_es,
        charge_en=charge_en,
        charge_es=charge_es,
        team=team,
        is_team_leader=True,
        is_active=True
    )
    
    # Set password in member model (for legacy compatibility if needed)
    member.set_password(password)
    member.save()
    
    print(f"✅ Member profile created successfully! (ID: {member.id})")
    
    print(f"\n" + "="*60)
    print(f"🎉 SUPERUSER CREATED SUCCESSFULLY!")
    print(f"="*60)
    print(f"Username:     {username}")
    print(f"Email:        {email}")
    print(f"Password:     {password}")
    print(f"Name:         {first_name} {last_name}")
    print(f"Team:         {team.name_en}")
    print(f"Role:         {role_en}")
    print(f"User ID:      {user.id}")
    print(f"Member ID:    {member.id}")
    print(f"="*60)
    print(f"\n📝 Next steps:")
    print(f"1. Add profile image at: backend/media/members/julian_galindo.jpg")
    print(f"2. Login at: http://localhost:8000/admin")
    print(f"3. Or use the login page: http://localhost:5173/login")
    print(f"="*60)

if __name__ == '__main__':
    create_superuser_with_member()

#!/usr/bin/env python
"""
Script to update member with profile image
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'candelaria_project.settings')
django.setup()

from api.models import Member
from django.core.files import File

def update_member_image():
    """Update member 8 with profile image"""
    
    try:
        member = Member.objects.get(id=8)
        print(f"✓ Found member: {member.name}")
        
        # For now, just mark that image needs to be added manually
        print(f"\n📸 To add the profile image:")
        print(f"1. Save the image to: backend/media/members/julian_galindo.jpg")
        print(f"2. Then run this command:")
        print(f"   cd backend")
        print(f"   ./venv/bin/python manage.py shell")
        print(f"   >>> from api.models import Member")
        print(f"   >>> from django.core.files import File")
        print(f"   >>> member = Member.objects.get(id=8)")
        print(f"   >>> with open('media/members/julian_galindo.jpg', 'rb') as f:")
        print(f"   ...     member.image.save('julian_galindo.jpg', File(f), save=True)")
        print(f"   >>> exit()")
        
    except Member.DoesNotExist:
        print(f"❌ Member with ID 8 not found!")

if __name__ == '__main__':
    update_member_image()

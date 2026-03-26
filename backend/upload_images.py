#!/usr/bin/env python3
"""
Helper script to upload images to Publications, Teams, or Members
Usage:
    python upload_images.py --type publication --id 1 --image path/to/image.jpg
    python upload_images.py --type team --id 2 --image path/to/logo.png
    python upload_images.py --type member --id 3 --image path/to/photo.jpg
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'candelaria_project.settings')
django.setup()

from api.models import Team, Member, Publication
from django.core.files import File
import argparse


def upload_image(model_type, object_id, image_path):
    """Upload an image to a model instance"""
    
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return False
    
    try:
        # Get the model and instance
        if model_type == 'team':
            Model = Team
            folder = 'teams'
        elif model_type == 'member':
            Model = Member
            folder = 'members'
        elif model_type == 'publication':
            Model = Publication
            folder = 'publications'
        else:
            print(f"❌ Error: Invalid type '{model_type}'. Use: team, member, or publication")
            return False
        
        # Get the instance
        instance = Model.objects.get(id=object_id)
        print(f"✅ Found {model_type}: {instance}")
        
        # Open and save the image
        with open(image_path, 'rb') as f:
            filename = os.path.basename(image_path)
            instance.image.save(filename, File(f), save=True)
        
        print(f"✅ Image uploaded successfully!")
        print(f"   URL: /media/{folder}/{filename}")
        return True
        
    except Model.DoesNotExist:
        print(f"❌ Error: {model_type.capitalize()} with ID {object_id} not found")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def list_items(model_type):
    """List all items of a given type"""
    
    if model_type == 'team':
        items = Team.objects.all()
        print("\n📋 Available Teams:")
        for item in items:
            has_image = "🖼️" if item.image else "❌"
            print(f"   {has_image} ID {item.id}: {item.name_en}")
            
    elif model_type == 'member':
        items = Member.objects.select_related('team').all()
        print("\n📋 Available Members:")
        for item in items:
            has_image = "🖼️" if item.image else "❌"
            print(f"   {has_image} ID {item.id}: {item.name} ({item.team.name_en})")
            
    elif model_type == 'publication':
        items = Publication.objects.all()
        print("\n📋 Available Publications:")
        for item in items:
            has_image = "🖼️" if item.image else "❌"
            print(f"   {has_image} ID {item.id}: {item.title_en}")
    
    print()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Upload images to database')
    parser.add_argument('--type', '-t', required=True,
                       choices=['team', 'member', 'publication'],
                       help='Type of object to update')
    parser.add_argument('--id', type=int,
                       help='ID of the object to update')
    parser.add_argument('--image', '-i',
                       help='Path to the image file')
    parser.add_argument('--list', '-l', action='store_true',
                       help='List all items of the given type')
    
    args = parser.parse_args()
    
    if args.list:
        list_items(args.type)
    elif args.id and args.image:
        upload_image(args.type, args.id, args.image)
    else:
        parser.print_help()
        print("\n💡 Examples:")
        print("   # List all publications:")
        print("   python upload_images.py --type publication --list")
        print("\n   # Upload image to publication #1:")
        print("   python upload_images.py --type publication --id 1 --image banner.jpg")
        print("\n   # Upload team logo:")
        print("   python upload_images.py --type team --id 2 --image logo.png")

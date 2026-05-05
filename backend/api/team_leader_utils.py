# Team Leader Environment Variable Utils

import os
from django.db import models
from .models import Team


def get_team_leader_info(email):
    """
    Check if an email is in any team leader environment variable whitelist
    
    Args:
        email (str): Email address to check
        
    Returns:
        dict: {
            'is_team_leader': bool,
            'team_key': str or None,  # e.g. 'design', 'batteries'
            'team': Team object or None
        }
    """
    if not email:
        return {'is_team_leader': False, 'team_key': None, 'team': None}
    
    email = email.lower().strip()
    
    # Team mapping from env var suffix to team identification
    team_mappings = {
        'EXECUTIVE_COMMITTEE': {
            'key': 'executive-committee',
            'search_terms': ['executive', 'committee']
        },
        'BATTERIES': {
            'key': 'batteries',
            'search_terms': ['batteries', 'battery']
        },
        'CELLS': {
            'key': 'cells',
            'search_terms': ['cells', 'cell']
        },
        'CHASSIS': {
            'key': 'chassis',
            'search_terms': ['chassis']
        },
        'LOGISTICS': {
            'key': 'logistics',
            'search_terms': ['logistics', 'logistic']
        },
        'DESIGN': {
            'key': 'design',
            'search_terms': ['design']
        },
        'HUMAN_RESOURCES': {
            'key': 'human-resources',
            'search_terms': ['human', 'resources', 'hr']
        }
    }
    
    for env_suffix, team_info in team_mappings.items():
        env_var = f"TEAM_LEADERS_{env_suffix}"
        team_leaders = os.getenv(env_var, '').split(',')
        
        if email in [leader.lower().strip() for leader in team_leaders if leader.strip()]:
            # Find the corresponding team
            team = None
            for search_term in team_info['search_terms']:
                team = Team.objects.filter(
                    models.Q(name_en__icontains=search_term) | 
                    models.Q(name_es__icontains=search_term)
                ).first()
                if team:
                    break
            
            return {
                'is_team_leader': True,
                'team_key': team_info['key'],
                'team': team
            }
    
    return {'is_team_leader': False, 'team_key': None, 'team': None}


def is_email_team_leader(email):
    """
    Simple check if email is a team leader
    
    Args:
        email (str): Email address to check
        
    Returns:
        bool: True if email is a team leader
    """
    return get_team_leader_info(email)['is_team_leader']
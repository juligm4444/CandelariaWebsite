# Email Whitelist Utility
# Functions to check if an email is allowed to register

import os
from pathlib import Path

def get_allowed_emails():
    """
    Read and return the list of allowed emails from allowed_emails.txt
    
    Returns:
        set: Set of lowercase email addresses
    """
    file_path = Path(__file__).parent / 'allowed_emails.txt'
    
    if not file_path.exists():
        return set()
    
    allowed_emails = set()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            # Remove whitespace and convert to lowercase
            line = line.strip().lower()
            
            # Skip empty lines and comments
            if line and not line.startswith('#'):
                allowed_emails.add(line)
    
    return allowed_emails


def is_email_allowed(email):
    """
    Check if an email is in the whitelist
    
    Args:
        email (str): Email address to check
        
    Returns:
        bool: True if email is allowed, False otherwise
    """
    if not email:
        return False
    
    email = email.strip().lower()
    allowed_emails = get_allowed_emails()
    
    return email in allowed_emails


def add_email_to_whitelist(email):
    """
    Add an email to the whitelist file
    
    Args:
        email (str): Email address to add
        
    Returns:
        bool: True if added successfully, False if already exists
    """
    email = email.strip().lower()
    
    if is_email_allowed(email):
        return False  # Email already exists
    
    file_path = Path(__file__).parent / 'allowed_emails.txt'
    
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(f'\n{email}')
    
    return True


def remove_email_from_whitelist(email):
    """
    Remove an email from the whitelist file
    
    Args:
        email (str): Email address to remove
        
    Returns:
        bool: True if removed successfully, False if not found
    """
    email = email.strip().lower()
    file_path = Path(__file__).parent / 'allowed_emails.txt'
    
    if not file_path.exists():
        return False
    
    # Read all lines
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Filter out the email to remove
    new_lines = []
    found = False
    
    for line in lines:
        line_stripped = line.strip().lower()
        if line_stripped == email:
            found = True
            continue  # Skip this line
        new_lines.append(line)
    
    if not found:
        return False
    
    # Write back the filtered lines
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    return True

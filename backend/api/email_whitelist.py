# Email Whitelist Utility
# Functions to check if an email is allowed to register

from .models import InternalWhitelistEntry

SECTION_LEADERS = 'leaders'
SECTION_COLEADERS = 'coleaders'
SECTION_MEMBERS = 'members'

VALID_SECTIONS = {SECTION_LEADERS, SECTION_COLEADERS, SECTION_MEMBERS}

ROLE_TO_SECTION = {
    InternalWhitelistEntry.ROLE_LEADER: SECTION_LEADERS,
    InternalWhitelistEntry.ROLE_COLEADER: SECTION_COLEADERS,
    InternalWhitelistEntry.ROLE_MEMBER: SECTION_MEMBERS,
}

SECTION_TO_ROLE = {
    SECTION_LEADERS: InternalWhitelistEntry.ROLE_LEADER,
    SECTION_COLEADERS: InternalWhitelistEntry.ROLE_COLEADER,
    SECTION_MEMBERS: InternalWhitelistEntry.ROLE_MEMBER,
}


def _normalize_email(email):
    return (email or '').strip().lower()


def get_allowed_emails_by_section():
    grouped = {
        SECTION_LEADERS: set(),
        SECTION_COLEADERS: set(),
        SECTION_MEMBERS: set(),
    }

    for entry in InternalWhitelistEntry.objects.all().only('email', 'internal_role'):
        section = ROLE_TO_SECTION.get(entry.internal_role, SECTION_MEMBERS)
        grouped[section].add(entry.email.lower())

    return grouped

def get_allowed_emails():
    """
    Read and return the list of allowed emails from database whitelist entries
    
    Returns:
        set: Set of lowercase email addresses
    """
    grouped = get_allowed_emails_by_section()
    return grouped[SECTION_LEADERS] | grouped[SECTION_COLEADERS] | grouped[SECTION_MEMBERS]


def get_email_whitelist_role(email):
    """Return role section for a whitelisted email or None when absent."""
    email = _normalize_email(email)
    if not email:
        return None

    entry = InternalWhitelistEntry.objects.filter(email=email).only('internal_role').first()
    if not entry:
        return None

    return ROLE_TO_SECTION.get(entry.internal_role, SECTION_MEMBERS)


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
    
    return get_email_whitelist_role(email) is not None


def add_email_to_whitelist(email):
    """
    Add an email to the whitelist file
    
    Args:
        email (str): Email address to add
        
    Returns:
        bool: True if added successfully, False if already exists
    """
    return add_email_to_whitelist_section(email, SECTION_MEMBERS)


def add_email_to_whitelist_section(email, section):
    """Add an email to a specific whitelist section."""
    email = _normalize_email(email)
    section = (section or '').strip().lower()

    if not email or section not in VALID_SECTIONS:
        return False

    role = SECTION_TO_ROLE[section]
    entry = InternalWhitelistEntry.objects.filter(email=email).first()
    if entry:
        if entry.internal_role != role:
            entry.internal_role = role
            entry.save(update_fields=['internal_role'])
        return False

    InternalWhitelistEntry.objects.create(email=email, internal_role=role)
    return True


def remove_email_from_whitelist(email):
    """
    Remove an email from the whitelist table
    
    Args:
        email (str): Email address to remove
        
    Returns:
        bool: True if removed successfully, False if not found
    """
    email = _normalize_email(email)
    if not email:
        return False

    deleted, _ = InternalWhitelistEntry.objects.filter(email=email).delete()
    return deleted > 0

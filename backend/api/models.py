from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.template.defaultfilters import slugify
from django.db.models import Q
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from .member_catalog import resolve_career_pair_from_text


class Team(models.Model):
    """Team model representing different teams in the project"""
    name_en = models.CharField(max_length=100, unique=True)
    name_es = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='teams/', null=True, blank=True)

    class Meta:
        db_table = 'teams'
        ordering = ['id']

    def __str__(self):
        return self.name_en

    def to_dict(self):
        """Return team data as dictionary"""
        team_image = self.image.url if self.image else None
        
        return {
            'id': self.id,
            'name_en': self.name_en,
            'name_es': self.name_es,
            'image': team_image
        }


class Member(models.Model):
    """Member model representing team members with authentication"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='member_profile',
        null=False,
        blank=False
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=200, unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    career_en = models.CharField(max_length=200)
    career_es = models.CharField(max_length=200)
    role_en = models.CharField(max_length=100)
    role_es = models.CharField(max_length=100)
    image = models.ImageField(upload_to='members/', null=True, blank=True)
    is_team_leader = models.BooleanField(default=False)
    is_coleader = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        db_column='team_id'
    )

    class Meta:
        db_table = 'members'
        ordering = ['id']
        constraints = [
            models.CheckConstraint(
                check=~(Q(is_team_leader=True) & Q(is_coleader=True)),
                name='member_not_leader_and_coleader',
            ),
            models.UniqueConstraint(
                fields=['team'],
                condition=Q(is_team_leader=True, is_active=True),
                name='unique_active_leader_per_team',
            ),
            models.UniqueConstraint(
                fields=['team'],
                condition=Q(is_coleader=True, is_active=True),
                name='unique_active_coleader_per_team',
            ),
        ]

    def __str__(self):
        return self.name

    def set_password(self, raw_password):
        """Hash password using bcrypt"""
        import bcrypt
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, raw_password):
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(
            raw_password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self, language='en', include_email=False):
        """Return member data as dictionary for specified language"""
        image_path = self.image.url if self.image else None
        
        career_pair = resolve_career_pair_from_text(self.career_en) or resolve_career_pair_from_text(self.career_es)

        data = {
            'id': self.id,
            'name': self.name,
            'career': self.career_en if language == 'en' else self.career_es,
            'career_key': career_pair['key'] if career_pair else None,
            'role': self.role_en if language == 'en' else self.role_es,
            'image': image_path,
            'team_id': self.team.id,
            'team_name': self.team.name_en if language == 'en' else self.team.name_es,
            'is_team_leader': self.is_team_leader,
            'is_coleader': self.is_coleader,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'social_links': [link.to_dict() for link in self.social_links.all()]
        }
        
        # Only include email and all language versions for authenticated requests
        if include_email:
            data['email'] = self.email
            data['career_en'] = self.career_en
            data['career_es'] = self.career_es
            data['role_en'] = self.role_en
            data['role_es'] = self.role_es

        return data


class InternalWhitelistEntry(models.Model):
    """Database-backed whitelist entries for internal team users."""

    ROLE_LEADER = 'leader'
    ROLE_COLEADER = 'coleader'
    ROLE_MEMBER = 'member'

    INTERNAL_ROLE_CHOICES = [
        (ROLE_LEADER, 'Leader'),
        (ROLE_COLEADER, 'Co-Leader'),
        (ROLE_MEMBER, 'Member'),
    ]

    email = models.EmailField(max_length=200, unique=True)
    internal_role = models.CharField(max_length=20, choices=INTERNAL_ROLE_CHOICES, default=ROLE_MEMBER)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='whitelist_invites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'internal_whitelist'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} ({self.internal_role})'


class UserProfile(models.Model):
    """Unified profile for all authenticated users (internal and external)."""

    ROLE_LEADER = InternalWhitelistEntry.ROLE_LEADER
    ROLE_COLEADER = InternalWhitelistEntry.ROLE_COLEADER
    ROLE_MEMBER = InternalWhitelistEntry.ROLE_MEMBER

    INTERNAL_ROLE_CHOICES = InternalWhitelistEntry.INTERNAL_ROLE_CHOICES

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    email = models.EmailField(max_length=200)
    name = models.CharField(max_length=200)
    is_internal = models.BooleanField(default=False)
    internal_role = models.CharField(max_length=20, choices=INTERNAL_ROLE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} ({"internal" if self.is_internal else "external"})'


class Subscription(models.Model):
    """Subscription plans for users."""

    STATUS_ACTIVE = 'active'
    STATUS_CANCELED = 'canceled'
    STATUS_PAST_DUE = 'past_due'
    STATUS_INCOMPLETE = 'incomplete'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_CANCELED, 'Canceled'),
        (STATUS_PAST_DUE, 'Past Due'),
        (STATUS_INCOMPLETE, 'Incomplete'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_INCOMPLETE)
    next_billing_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id}:{self.plan}:{self.status}'


class Payment(models.Model):
    """Payment records for donations, subscriptions, and store purchases."""

    TYPE_DONATION = 'donation'
    TYPE_SUBSCRIPTION = 'subscription'
    TYPE_PRODUCT = 'product'

    TYPE_CHOICES = [
        (TYPE_DONATION, 'Donation'),
        (TYPE_SUBSCRIPTION, 'Subscription'),
        (TYPE_PRODUCT, 'Product'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_SUCCEEDED = 'succeeded'
    STATUS_FAILED = 'failed'
    STATUS_CANCELED = 'canceled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCEEDED, 'Succeeded'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_CANCELED, 'Canceled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='cop')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    payu_transaction_id = models.CharField(max_length=120, null=True, blank=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id}:{self.type}:{self.status}'


class Publication(models.Model):
    """Publication model for team publications and posts"""
    slug = models.SlugField(max_length=340, unique=True)
    name_en = models.CharField(max_length=300)
    name_es = models.CharField(max_length=300)
    abstract_en = models.TextField()
    abstract_es = models.TextField()
    publication_date = models.DateField(auto_now_add=True)
    file = models.FileField(upload_to='publications/files/', blank=True)
    image = models.ImageField(upload_to='publications/', null=True, blank=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.SET_NULL,
        null=True,
        related_name='publications',
        db_column='author_id'
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='publications',
        db_column='team_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'publications'
        ordering = ['-publication_date', 'id']

    def __str__(self):
        return self.name_en

    def clean(self):
        if self.file and not str(self.file.name).lower().endswith('.pdf'):
            raise ValidationError({'file': 'Only PDF files are allowed.'})

    def save(self, *args, **kwargs):
        if not self.slug:
            source = self.name_en or self.name_es or 'publication'
            base_slug = slugify(source) or 'publication'
            unique_slug = base_slug
            suffix = 1
            while Publication.objects.exclude(pk=self.pk).filter(slug=unique_slug).exists():
                suffix += 1
                unique_slug = f'{base_slug}-{suffix}'
            self.slug = unique_slug

        self.full_clean()
        super().save(*args, **kwargs)

    def to_dict(self, language='en'):
        """Return publication data as dictionary for specified language"""
        pub_image = self.image.url if self.image else None
        pub_file = self.file.url if self.file else None
        
        return {
            'id': self.id,
            'slug': self.slug,
            'name': self.name_en if language == 'en' else self.name_es,
            'abstract': self.abstract_en if language == 'en' else self.abstract_es,
            'publication_date': self.publication_date.isoformat(),
            'file': pub_file,
            'image': pub_image,
            'author_id': self.author.id if self.author else None,
            'author_name': self.author.name if self.author else None,
            'team_id': self.team.id if self.team else None,
            'team_name': (self.team.name_en if language == 'en' else self.team.name_es) if self.team else None,
            'created_at': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            'updated_at': self.updated_at.isoformat() if hasattr(self, 'updated_at') else None
        }


class RedSocial(models.Model):
    """Social media links for team members"""
    PLATFORM_BEHANCE = 'behance'
    PLATFORM_PORTFOLIO = 'portfolio'
    PLATFORM_GITHUB = 'github'
    PLATFORM_INSTAGRAM = 'instagram'
    PLATFORM_LINKEDIN = 'linkedin'
    PLATFORM_X = 'x'

    PLATFORM_CHOICES = [
        (PLATFORM_BEHANCE, 'Behance'),
        (PLATFORM_PORTFOLIO, 'Portfolio'),
        (PLATFORM_GITHUB, 'GitHub'),
        (PLATFORM_INSTAGRAM, 'Instagram'),
        (PLATFORM_LINKEDIN, 'LinkedIn'),
        (PLATFORM_X, 'X'),
    ]

    url = models.CharField(max_length=300, unique=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='social_links',
        db_column='member_id'
    )

    class Meta:
        db_table = 'red_social'
        ordering = ['id']

    def __str__(self):
        return f"{self.member.name} - {self.platform}"

    def to_dict(self):
        """Return social media data as dictionary"""
        return {
            'id': self.id,
            'platform': self.platform,
            'url': self.url,
            'member_id': self.member.id,
        }


class PaymentCheckoutSession(models.Model):
    """Server-side payment workflow state for checkout sessions."""
    STATUS_CREATED = 'created'
    STATUS_PENDING = 'pending'
    STATUS_SUCCEEDED = 'succeeded'
    STATUS_FAILED = 'failed'
    STATUS_CANCELED = 'canceled'

    STATUS_CHOICES = [
        (STATUS_CREATED, 'Created'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCEEDED, 'Succeeded'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_CANCELED, 'Canceled'),
    ]

    ITEM_MEMBERSHIP = 'membership'
    ITEM_PRODUCT = 'product'
    ITEM_DONATION = 'donation'

    ITEM_TYPE_CHOICES = [
        (ITEM_MEMBERSHIP, 'Membership'),
        (ITEM_PRODUCT, 'Product'),
        (ITEM_DONATION, 'Donation'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    member = models.ForeignKey(Member, on_delete=models.PROTECT, related_name='payment_sessions', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='payment_sessions')
    provider = models.CharField(max_length=30, default='stripe')
    provider_session_id = models.CharField(max_length=120, unique=True, null=True, blank=True)
    idempotency_key = models.CharField(max_length=120, unique=True)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    item_id = models.CharField(max_length=100)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default='usd')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CREATED)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_checkout_sessions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider', 'status'], name='pay_sess_prov_status_idx'),
            models.Index(fields=['member', 'created_at'], name='pay_sess_member_created_idx'),
        ]

    def __str__(self):
        return f'{self.provider}:{self.reference} ({self.status})'

    def transition(self, new_status):
        allowed = {
            self.STATUS_CREATED: {self.STATUS_PENDING, self.STATUS_SUCCEEDED, self.STATUS_FAILED, self.STATUS_CANCELED},
            self.STATUS_PENDING: {self.STATUS_SUCCEEDED, self.STATUS_FAILED, self.STATUS_CANCELED},
            self.STATUS_SUCCEEDED: set(),
            self.STATUS_FAILED: set(),
            self.STATUS_CANCELED: set(),
        }
        if new_status not in allowed.get(self.status, set()):
            raise ValidationError({'status': f'Invalid transition from {self.status} to {new_status}.'})
        self.status = new_status
        self.updated_at = timezone.now()


class PaymentWebhookEvent(models.Model):
    """Stores webhook delivery data to prevent replay and duplicate processing."""
    provider = models.CharField(max_length=30, default='stripe')
    provider_event_id = models.CharField(max_length=120, unique=True)
    event_type = models.CharField(max_length=120)
    signature_verified = models.BooleanField(default=False)
    payload_hash = models.CharField(max_length=64)
    raw_payload = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_webhook_events'
        ordering = ['-received_at']
        indexes = [
            models.Index(fields=['provider', 'event_type'], name='pay_webhook_prov_type_idx'),
        ]

    def __str__(self):
        return f'{self.provider}:{self.provider_event_id}'


class SecurityAuditEvent(models.Model):
    """Security/audit log for sensitive operations and payment activities."""
    event_type = models.CharField(max_length=120)
    severity = models.CharField(max_length=20, default='info')
    actor_member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.CharField(max_length=64, null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'security_audit_events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at'], name='sec_audit_type_created_idx'),
            models.Index(fields=['severity', 'created_at'], name='sec_audit_sev_created_idx'),
        ]

    def __str__(self):
        return f'{self.severity}:{self.event_type}'


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    """Auto-create profile rows for users created outside auth serializers."""
    if not created:
        return

    UserProfile.objects.get_or_create(
        user=instance,
        defaults={
            'email': (instance.email or instance.username or '').strip().lower(),
            'name': (instance.first_name or instance.username or '').strip(),
            'is_internal': False,
            'internal_role': None,
        },
    )

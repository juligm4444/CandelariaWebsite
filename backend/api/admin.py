from django.contrib import admin
from .models import (
    Team,
    Member,
    Publication,
    RedSocial,
    PaymentCheckoutSession,
    PaymentWebhookEvent,
    SecurityAuditEvent,
    InternalWhitelistEntry,
    UserProfile,
    Subscription,
    Payment,
    TeamLeaderWhitelist,
    TeamLeaderRequest,
)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_en', 'name_es']
    search_fields = ['name_en', 'name_es']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'role_en', 'team', 'is_team_leader', 'is_coleader', 'is_active']
    list_filter = ['team', 'is_team_leader', 'is_coleader', 'is_active']
    search_fields = ['name', 'email', 'role_en', 'role_es']
    list_editable = ['is_team_leader', 'is_coleader', 'is_active']
    fields = ['user', 'name', 'email', 'image', 'career_en', 'career_es',
              'role_en', 'role_es', 'team',
              'is_team_leader', 'is_coleader', 'is_active', 'password_hash']
    readonly_fields = ['password_hash']
    
    # Disable admin logging to avoid the ID sequence issue
    def log_addition(self, request, object, message):
        pass
    
    def log_change(self, request, object, message):
        pass
    
    def log_deletion(self, request, object, object_repr):
        pass
    
    def log_addition(self, request, object, message):
        """Disable logging to avoid constraint errors"""
        pass
    
    def log_change(self, request, object, message):
        """Disable logging to avoid constraint errors"""
        pass
    
    def log_deletion(self, request, object, object_repr):
        """Disable logging to avoid constraint errors"""
        pass


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'slug', 'name_en', 'publication_date', 'team']
    list_filter = ['team', 'publication_date']
    search_fields = ['name_en', 'name_es', 'slug']
    date_hierarchy = 'publication_date'


@admin.register(RedSocial)
class RedSocialAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'platform', 'url']
    list_filter = ['member', 'platform']
    search_fields = ['member__name', 'url', 'platform']


@admin.register(PaymentCheckoutSession)
class PaymentCheckoutSessionAdmin(admin.ModelAdmin):
    list_display = ['reference', 'user', 'member', 'provider', 'item_type', 'amount_cents', 'currency', 'status', 'created_at']
    list_filter = ['provider', 'item_type', 'status', 'currency']
    search_fields = ['reference', 'idempotency_key', 'provider_session_id', 'member__email', 'user__email']
    readonly_fields = ['reference', 'created_at', 'updated_at']


@admin.register(PaymentWebhookEvent)
class PaymentWebhookEventAdmin(admin.ModelAdmin):
    list_display = ['provider_event_id', 'provider', 'event_type', 'signature_verified', 'received_at', 'processed_at']
    list_filter = ['provider', 'event_type', 'signature_verified']
    search_fields = ['provider_event_id', 'event_type', 'payload_hash']
    readonly_fields = ['received_at', 'processed_at', 'payload_hash']


@admin.register(SecurityAuditEvent)
class SecurityAuditEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'severity', 'actor_member', 'ip_address', 'created_at']
    list_filter = ['severity', 'event_type']
    search_fields = ['event_type', 'ip_address', 'actor_member__email']
    readonly_fields = ['created_at']


@admin.register(InternalWhitelistEntry)
class InternalWhitelistEntryAdmin(admin.ModelAdmin):
    list_display = ['email', 'internal_role', 'invited_by', 'created_at']
    list_filter = ['internal_role']
    search_fields = ['email', 'invited_by__email']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'name', 'is_internal', 'internal_role', 'created_at']
    list_filter = ['is_internal', 'internal_role']
    search_fields = ['email', 'name', 'user__username']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plan', 'status', 'next_billing_date', 'created_at']
    list_filter = ['status', 'plan']
    search_fields = ['user__email', 'plan']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'currency', 'type', 'status', 'payu_transaction_id', 'created_at']
    list_filter = ['status', 'type', 'currency']
    search_fields = ['user__email', 'payu_transaction_id']


@admin.register(TeamLeaderWhitelist)
class TeamLeaderWhitelistAdmin(admin.ModelAdmin):
    list_display = ['email', 'team', 'first_name', 'last_name', 'is_active', 'created_at']
    list_filter = ['team', 'is_active', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'team__name_en', 'team__name_es']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('DEPRECATED WARNING', {
            'fields': (),
            'description': '<strong style="color: red;">⚠️ This model is DEPRECATED. Use Team Leader Requests instead for secure approval process.</strong>'
        }),
        (None, {
            'fields': ('email', 'team', 'first_name', 'last_name', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(TeamLeaderRequest)
class TeamLeaderRequestAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'requested_team', 'status', 'is_whitelist_verified', 
        'is_admin_approved', 'approved_by', 'created_at'
    ]
    list_filter = [
        'status', 'is_whitelist_verified', 'is_admin_approved', 
        'requested_team', 'created_at'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'requested_team__name_en']
    readonly_fields = [
        'created_at', 'ip_address', 'user_agent', 'is_whitelist_verified',
        'approved_at', 'approved_by'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('email', 'requested_team', 'first_name', 'last_name', 'status')
        }),
        ('Security Verification', {
            'fields': ('is_whitelist_verified', 'is_admin_approved'),
            'classes': ('collapse',)
        }),
        ('Approval Information', {
            'fields': ('approved_by', 'approved_at'),
            'classes': ('collapse',)
        }),
        ('Audit Trail', {
            'fields': ('created_at', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['verify_whitelist', 'deny_requests']
    
    def verify_whitelist(self, request, queryset):
        """Verify selected requests against environment whitelist (auto-assigns if whitelisted)"""
        verified_count = 0
        for req in queryset.filter(status='pending_verification'):
            if req.verify_whitelist():
                verified_count += 1
        
        self.message_user(
            request,
            f"✅ Verified and auto-assigned {verified_count} team leadership requests."
        )
    verify_whitelist.short_description = "🔍 Verify against whitelist (auto-assigns)"
    
    # Remove the approve_requests action since it's now automatic
    
    def deny_requests(self, request, queryset):
        """Deny selected requests"""
        denied_count = queryset.filter(
            status__in=['pending_verification', 'pending_approval']
        ).update(status='denied')
        
        self.message_user(
            request,
            f"❌ Denied {denied_count} team leadership requests."
        )
    deny_requests.short_description = "❌ Deny selected requests"

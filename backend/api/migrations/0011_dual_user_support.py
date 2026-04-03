from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def backfill_profiles_and_payment_users(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL.split('.')[0], settings.AUTH_USER_MODEL.split('.')[1])
    Member = apps.get_model('api', 'Member')
    UserProfile = apps.get_model('api', 'UserProfile')
    PaymentCheckoutSession = apps.get_model('api', 'PaymentCheckoutSession')

    ROLE_LEADER = 'leader'
    ROLE_COLEADER = 'coleader'
    ROLE_MEMBER = 'member'

    for user in User.objects.all().iterator():
        member = Member.objects.filter(user_id=user.id).first()
        is_internal = member is not None
        internal_role = None
        name = (user.first_name or user.username or '').strip()

        if member:
            name = (member.name or name).strip()
            if member.is_team_leader:
                internal_role = ROLE_LEADER
            elif member.is_coleader:
                internal_role = ROLE_COLEADER
            else:
                internal_role = ROLE_MEMBER

        UserProfile.objects.update_or_create(
            user_id=user.id,
            defaults={
                'email': (user.email or user.username or '').strip().lower(),
                'name': name,
                'is_internal': is_internal,
                'internal_role': internal_role,
            },
        )

    for session in PaymentCheckoutSession.objects.filter(user_id__isnull=True).iterator():
        if session.member_id:
            member = Member.objects.filter(id=session.member_id).first()
            if member and member.user_id:
                session.user_id = member.user_id
                session.save(update_fields=['user'])


def seed_whitelist_from_legacy_file(apps, schema_editor):
    InternalWhitelistEntry = apps.get_model('api', 'InternalWhitelistEntry')

    try:
        from api.email_whitelist import get_allowed_emails_by_section, SECTION_LEADERS, SECTION_COLEADERS, SECTION_MEMBERS
    except Exception:
        return

    grouped = get_allowed_emails_by_section()

    mapping = {
        SECTION_LEADERS: 'leader',
        SECTION_COLEADERS: 'coleader',
        SECTION_MEMBERS: 'member',
    }

    for section, emails in grouped.items():
        role = mapping.get(section, 'member')
        for email in emails:
            InternalWhitelistEntry.objects.update_or_create(
                email=email,
                defaults={'internal_role': role},
            )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_publication_name_en_alter_publication_name_es_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='InternalWhitelistEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=200, unique=True)),
                ('internal_role', models.CharField(choices=[('leader', 'Leader'), ('coleader', 'Co-Leader'), ('member', 'Member')], default='member', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invited_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='whitelist_invites', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'internal_whitelist',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('currency', models.CharField(default='cop', max_length=10)),
                ('type', models.CharField(choices=[('donation', 'Donation'), ('subscription', 'Subscription'), ('product', 'Product')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('canceled', 'Canceled')], default='pending', max_length=20)),
                ('payu_transaction_id', models.CharField(blank=True, max_length=120, null=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'payments',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plan', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('active', 'Active'), ('canceled', 'Canceled'), ('past_due', 'Past Due'), ('incomplete', 'Incomplete')], default='incomplete', max_length=20)),
                ('next_billing_date', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'subscriptions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=200)),
                ('name', models.CharField(max_length=200)),
                ('is_internal', models.BooleanField(default=False)),
                ('internal_role', models.CharField(blank=True, choices=[('leader', 'Leader'), ('coleader', 'Co-Leader'), ('member', 'Member')], max_length=20, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'profiles',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='paymentcheckoutsession',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='payment_sessions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='paymentcheckoutsession',
            name='member',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='payment_sessions', to='api.member'),
        ),
        migrations.RunPython(backfill_profiles_and_payment_users, migrations.RunPython.noop),
        migrations.RunPython(seed_whitelist_from_legacy_file, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='paymentcheckoutsession',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payment_sessions', to=settings.AUTH_USER_MODEL),
        ),
    ]

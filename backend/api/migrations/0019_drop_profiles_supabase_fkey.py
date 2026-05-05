from django.db import migrations


class Migration(migrations.Migration):
    """
    The profiles.id column has a FK to auth.users (Supabase's internal auth table).
    Django-generated UUIDs don't exist there, causing FK violations on every insert.
    Drop that constraint and add gen_random_uuid() as the column default so the
    database can generate ids when Django doesn't supply one explicitly.
    """

    dependencies = [
        ('api', '0018_userprofile_uuid_state_only'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
            ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]

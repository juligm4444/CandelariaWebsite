from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):
    """
    Aggressive repair for environments where the profiles table exists but
    is missing user_id (0011 didn't fully apply). Strategy: if user_id is
    absent the table has unusable data anyway, so drop and recreate it from
    scratch instead of trying to ALTER (which risks constraint name conflicts).
    """

    dependencies = [
        ('api', '0016_fix_profiles_schema'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunSQL(
            sql="CREATE EXTENSION IF NOT EXISTS pgcrypto;",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name   = 'profiles'
                      AND column_name  = 'user_id'
                ) THEN
                    DROP TABLE IF EXISTS profiles CASCADE;

                    CREATE TABLE profiles (
                        id            uuid         PRIMARY KEY,
                        user_id       integer      NOT NULL UNIQUE
                                                   REFERENCES auth_user(id)
                                                   ON DELETE CASCADE
                                                   DEFERRABLE INITIALLY DEFERRED,
                        email         varchar(200) NOT NULL DEFAULT '',
                        name          varchar(200) NOT NULL DEFAULT '',
                        is_internal   boolean      NOT NULL DEFAULT false,
                        internal_role varchar(20)  NULL,
                        created_at    timestamptz  NOT NULL DEFAULT now()
                    );

                    ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]

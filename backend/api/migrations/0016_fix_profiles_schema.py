from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):
    """
    Production repair: the profiles table may be missing columns if migration
    0011 didn't fully apply (e.g. if the table pre-existed with a different
    schema and the conditional DROP was skipped). This migration adds any
    missing columns idempotently so registration stops crashing.
    """

    dependencies = [
        ('api', '0015_create_internal_whitelist_table'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                -- If the profiles table doesn't exist at all, nothing to fix here;
                -- 0011 CreateModel will have already created it correctly.
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                ) THEN
                    RETURN;
                END IF;

                -- user_id (FK to auth_user) — the column that causes the crash
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'user_id'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN user_id integer NULL;
                    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey
                        FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;
                    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
                END IF;

                -- email
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'email'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN email varchar(200) NOT NULL DEFAULT '';
                END IF;

                -- name
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'name'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN name varchar(200) NOT NULL DEFAULT '';
                END IF;

                -- is_internal
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'is_internal'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN is_internal boolean NOT NULL DEFAULT false;
                END IF;

                -- internal_role
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'internal_role'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN internal_role varchar(20) NULL;
                END IF;

                -- created_at
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                      AND column_name = 'created_at'
                ) THEN
                    ALTER TABLE profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]

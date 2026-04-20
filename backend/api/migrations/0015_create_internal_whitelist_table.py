from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_alter_teamleaderwhitelist_options_teamleaderrequest'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS "internal_whitelist" (
                "id" bigserial NOT NULL PRIMARY KEY,
                "email" varchar(200) NOT NULL UNIQUE,
                "internal_role" varchar(20) NOT NULL DEFAULT 'member',
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "invited_by_id" integer NULL REFERENCES "auth_user" ("id") ON DELETE SET NULL
            );
            CREATE INDEX IF NOT EXISTS "internal_whitelist_email_idx"
                ON "internal_whitelist" ("email");
            CREATE INDEX IF NOT EXISTS "internal_whitelist_invited_by_idx"
                ON "internal_whitelist" ("invited_by_id");
            """,
            reverse_sql='DROP TABLE IF EXISTS "internal_whitelist";',
        ),
    ]

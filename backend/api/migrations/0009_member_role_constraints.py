from django.db import migrations, models
from django.db.models import Q
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_member_roles_and_publication_schema'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'members') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'email') THEN
            ALTER TABLE members ADD COLUMN email varchar(200);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'password_hash') THEN
            ALTER TABLE members ADD COLUMN password_hash varchar(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'is_team_leader') THEN
            ALTER TABLE members ADD COLUMN is_team_leader boolean NOT NULL DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'is_active') THEN
            ALTER TABLE members ADD COLUMN is_active boolean NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'created_at') THEN
            ALTER TABLE members ADD COLUMN created_at timestamp with time zone;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'image') THEN
            ALTER TABLE teams ADD COLUMN image varchar(100);
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publications') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'publications' AND column_name = 'author_id') THEN
            ALTER TABLE publications ADD COLUMN author_id bigint;
            ALTER TABLE publications
                ADD CONSTRAINT publications_author_id_fkey
                FOREIGN KEY (author_id) REFERENCES members(id)
                ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'publications' AND column_name = 'created_at') THEN
            ALTER TABLE publications ADD COLUMN created_at timestamp with time zone;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'publications' AND column_name = 'updated_at') THEN
            ALTER TABLE publications ADD COLUMN updated_at timestamp with time zone;
        END IF;
    END IF;
END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                )
            ],
            state_operations=[
                migrations.AddField(
                    model_name='team',
                    name='image',
                    field=models.ImageField(blank=True, null=True, upload_to='teams/'),
                ),
                migrations.AddField(
                    model_name='member',
                    name='email',
                    field=models.EmailField(blank=True, max_length=200, null=True, unique=True),
                ),
                migrations.AddField(
                    model_name='member',
                    name='password_hash',
                    field=models.CharField(blank=True, max_length=255, null=True),
                ),
                migrations.AddField(
                    model_name='member',
                    name='is_team_leader',
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name='member',
                    name='is_active',
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name='member',
                    name='created_at',
                    field=models.DateTimeField(auto_now_add=True, blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='publication',
                    name='author',
                    field=models.ForeignKey(
                        db_column='author_id',
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='publications',
                        to='api.member',
                    ),
                ),
                migrations.AddField(
                    model_name='publication',
                    name='created_at',
                    field=models.DateTimeField(auto_now_add=True),
                ),
                migrations.AddField(
                    model_name='publication',
                    name='updated_at',
                    field=models.DateTimeField(auto_now=True),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name='member',
            constraint=models.CheckConstraint(
                check=~(Q(is_team_leader=True) & Q(is_coleader=True)),
                name='member_not_leader_and_coleader',
            ),
        ),
        migrations.AddConstraint(
            model_name='member',
            constraint=models.UniqueConstraint(
                fields=('team',),
                condition=Q(is_team_leader=True, is_active=True),
                name='unique_active_leader_per_team',
            ),
        ),
        migrations.AddConstraint(
            model_name='member',
            constraint=models.UniqueConstraint(
                fields=('team',),
                condition=Q(is_coleader=True, is_active=True),
                name='unique_active_coleader_per_team',
            ),
        ),
    ]

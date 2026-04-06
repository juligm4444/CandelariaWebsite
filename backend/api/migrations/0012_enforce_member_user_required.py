from django.db import migrations, models
import django.db.models.deletion


def delete_members_without_user(apps, schema_editor):
    # Use SQL directly to avoid ORM relation traversal in legacy schemas.
    members_table = schema_editor.quote_name('members')
    socials_table = schema_editor.quote_name('red_social')
    sessions_table = schema_editor.quote_name('payment_checkout_sessions')

    schema_editor.execute(
        f'''DELETE FROM {socials_table}
            WHERE member_id IN (
                SELECT id FROM {members_table} WHERE user_id IS NULL
            )'''
    )
    schema_editor.execute(
        f'''DELETE FROM {sessions_table}
            WHERE member_id IN (
                SELECT id FROM {members_table} WHERE user_id IS NULL
            )'''
    )
    schema_editor.execute(f'DELETE FROM {members_table} WHERE user_id IS NULL')


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('api', '0011_dual_user_support'),
    ]

    operations = [
        migrations.RunPython(delete_members_without_user, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='member',
            name='user',
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='member_profile',
                to='auth.user',
            ),
        ),
    ]

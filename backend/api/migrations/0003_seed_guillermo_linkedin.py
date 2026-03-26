from django.db import migrations


def add_guillermo_linkedin(apps, schema_editor):
    Member = apps.get_model('api', 'Member')
    RedSocial = apps.get_model('api', 'RedSocial')

    member = Member.objects.filter(name='Guillermo Jimenez').first()
    if not member:
        return

    RedSocial.objects.update_or_create(
        url='https://www.linkedin.com/in/guillermo-jimenez-564452a/',
        defaults={
            'member': member,
            'platform': 'linkedin',
        },
    )


def remove_guillermo_linkedin(apps, schema_editor):
    Member = apps.get_model('api', 'Member')
    RedSocial = apps.get_model('api', 'RedSocial')

    member = Member.objects.filter(name='Guillermo Jimenez').first()
    if not member:
        return

    RedSocial.objects.filter(
        member=member,
        platform='linkedin',
        url='https://www.linkedin.com/in/guillermo-jimenez-564452a/'
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_redsocial'),
    ]

    operations = [
        migrations.RunPython(add_guillermo_linkedin, remove_guillermo_linkedin),
    ]

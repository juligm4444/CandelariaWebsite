from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_member_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='member',
            name='image_url',
        ),
        migrations.RemoveField(
            model_name='publication',
            name='image_url',
        ),
    ]

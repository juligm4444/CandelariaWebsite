# Generated manually for adding image field to Publication model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_seed_guillermo_linkedin'),
    ]

    operations = [
        migrations.AddField(
            model_name='publication',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='publications/'),
        ),
    ]

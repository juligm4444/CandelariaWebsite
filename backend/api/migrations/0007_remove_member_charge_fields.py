from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_remove_image_url_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='member',
            name='charge_en',
        ),
        migrations.RemoveField(
            model_name='member',
            name='charge_es',
        ),
    ]

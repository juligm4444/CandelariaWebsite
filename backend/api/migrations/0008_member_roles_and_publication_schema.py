from django.db import migrations, models
from django.template.defaultfilters import slugify


def cleanup_seed_data(apps, schema_editor):
    Publication = apps.get_model('api', 'Publication')

    Publication.objects.all().delete()


def populate_publication_slugs(apps, schema_editor):
    Publication = apps.get_model('api', 'Publication')
    existing = set()

    for publication in Publication.objects.all().order_by('id'):
        source = publication.name_en or publication.name_es or f'publication-{publication.id}'
        base = slugify(source) or f'publication-{publication.id}'
        candidate = base
        counter = 2
        while candidate in existing:
            candidate = f'{base}-{counter}'
            counter += 1
        publication.slug = candidate
        publication.save(update_fields=['slug'])
        existing.add(candidate)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_member_charge_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='is_coleader',
            field=models.BooleanField(default=False),
        ),
        migrations.RenameField(
            model_name='publication',
            old_name='title_en',
            new_name='name_en',
        ),
        migrations.RenameField(
            model_name='publication',
            old_name='title_es',
            new_name='name_es',
        ),
        migrations.RenameField(
            model_name='publication',
            old_name='content_en',
            new_name='abstract_en',
        ),
        migrations.RenameField(
            model_name='publication',
            old_name='content_es',
            new_name='abstract_es',
        ),
        migrations.AddField(
            model_name='publication',
            name='file',
            field=models.FileField(blank=True, upload_to='publications/files/'),
        ),
        migrations.AddField(
            model_name='publication',
            name='slug',
            field=models.SlugField(blank=True, max_length=340, null=True, db_index=False),
        ),
        migrations.RunPython(cleanup_seed_data, migrations.RunPython.noop),
        migrations.RunPython(populate_publication_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='publication',
            name='slug',
            field=models.SlugField(max_length=340, unique=True),
        ),
    ]

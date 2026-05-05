import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Sync Django's migration state with the actual database schema.
    The profiles.id column is already UUID in production (created by 0017),
    but Django's ORM thinks it's a BigAutoField and sends numeric values.
    SeparateDatabaseAndState updates the ORM state without touching the database.
    """

    dependencies = [
        ('api', '0017_repair_profiles_table'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name='userprofile',
                    name='id',
                    field=models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
            ],
        ),
    ]

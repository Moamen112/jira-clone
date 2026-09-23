import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0002_totp_columns"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="date_joined",
            new_name="created_at",
        ),
        migrations.AlterField(
            model_name="user",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AddField(
            model_name="user",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name="user",
            name="is_active",
        ),
    ]

from django.db import migrations


def purge_orphaned_commented_activity(apps, schema_editor):
    TaskActivity = apps.get_model("tasks", "TaskActivity")
    TaskActivity.objects.filter(action="commented", comment__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0007_alter_taskactivity_comment"),
    ]

    operations = [
        migrations.RunPython(
            purge_orphaned_commented_activity,
            migrations.RunPython.noop,
            elidable=True,
        ),
    ]

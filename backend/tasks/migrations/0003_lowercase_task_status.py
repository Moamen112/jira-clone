"""Lowercase the stored values of TaskStatus."""

from django.db import migrations, models

TASK_STATUS = {
    "TODO": "todo",
    "IN_PROGRESS": "in_progress",
    "IN_REVIEW": "in_review",
    "QA_REVIEW": "qa_review",
    "DONE": "done",
}


def _remap(apps, mapping):
    Task = apps.get_model("tasks", "Task")
    for old, new in mapping.items():
        Task.objects.filter(status=old).update(status=new)


def forwards(apps, schema_editor):
    _remap(apps, TASK_STATUS)


def backwards(apps, schema_editor):
    _remap(apps, {v: k for k, v in TASK_STATUS.items()})


class Migration(migrations.Migration):
    dependencies = [("tasks", "0002_initial")]

    operations = [
        migrations.AlterField(
            model_name="task",
            name="status",
            field=models.CharField(
                choices=[
                    ("todo", "To Do"),
                    ("in_progress", "In Progress"),
                    ("in_review", "In Review"),
                    ("qa_review", "QA Review"),
                    ("done", "Done"),
                ],
                default="todo",
                max_length=15,
            ),
        ),
        migrations.RunPython(forwards, backwards),
    ]

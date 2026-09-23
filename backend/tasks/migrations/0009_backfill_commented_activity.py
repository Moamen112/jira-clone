from django.db import migrations


def backfill_commented_activity(apps, schema_editor):
    Comment = apps.get_model("tasks", "Comment")
    TaskActivity = apps.get_model("tasks", "TaskActivity")

    linked = TaskActivity.objects.filter(comment__isnull=False).values("comment_id")
    orphaned = list(Comment.objects.exclude(id__in=linked).order_by("id"))
    if not orphaned:
        return

    entries = TaskActivity.objects.bulk_create(
        [
            TaskActivity(
                task_id=comment.task_id,
                actor_id=comment.author_id,
                comment_id=comment.id,
                action="commented",
                field="",
                old_value="",
                new_value="",
            )
            for comment in orphaned
        ]
    )

    for entry, comment in zip(entries, orphaned, strict=True):
        entry.created_at = comment.created_at
    TaskActivity.objects.bulk_update(entries, ["created_at"])


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0008_purge_orphaned_commented_activity"),
    ]

    operations = [
        migrations.RunPython(
            backfill_commented_activity,
            migrations.RunPython.noop,
            elidable=True,
        ),
    ]

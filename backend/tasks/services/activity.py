from django.db import transaction

from tasks.models import TaskActivity, TaskActivityAction


def display(value) -> str:
    if value is None or value == "":
        return ""
    if hasattr(value, "full_name"):
        return value.full_name or value.email
    if hasattr(value, "name"):
        return value.name
    return str(value)


def diff_task(task, validated_data: dict) -> list[tuple[str, str, str]]:
    changes: list[tuple[str, str, str]] = []
    for field in ("status", "assignee", "type", "title", "description", "due_date"):
        if field not in validated_data:
            continue
        old, new = display(getattr(task, field)), display(validated_data[field])
        if old != new:
            changes.append((field, old, new))
    return changes


def record_creation(task, actor) -> TaskActivity:
    return TaskActivity.objects.create(task=task, actor=actor, action=TaskActivityAction.CREATED)


@transaction.atomic
def record_changes(task, actor, changes: list[tuple[str, str, str]]) -> list[TaskActivity]:
    if not changes:
        return []
    return TaskActivity.objects.bulk_create(
        [
            TaskActivity(
                task=task,
                actor=actor,
                action=TaskActivityAction.UPDATED,
                field=field,
                old_value=old,
                new_value=new,
            )
            for field, old, new in changes
        ]
    )


def record_comment(comment) -> TaskActivity:
    return TaskActivity.objects.create(
        task=comment.task,
        actor=comment.author,
        comment=comment,
        action=TaskActivityAction.COMMENTED,
    )


def record_comment_deleted(comment, actor) -> TaskActivity:
    return TaskActivity.objects.create(
        task=comment.task, actor=actor, action=TaskActivityAction.COMMENT_DELETED
    )


@transaction.atomic
def record_unassignment(task_ids: list[int], user) -> list[TaskActivity]:
    if not task_ids:
        return []
    was = display(user)
    return TaskActivity.objects.bulk_create(
        [
            TaskActivity(
                task_id=task_id,
                actor=None,
                action=TaskActivityAction.UPDATED,
                field="assignee",
                old_value=was,
                new_value="",
            )
            for task_id in task_ids
        ]
    )

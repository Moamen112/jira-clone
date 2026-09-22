from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from projects.models import ARCHIVED_MESSAGE, Project
from tasks.models import Task, TaskStatus

from .activity import record_creation
from .key_generator import next_task_key


@transaction.atomic
def create_task(*, project: Project, reporter, **fields) -> Task:
    if project.is_archived:
        raise PermissionDenied(ARCHIVED_MESSAGE)

    fields.pop("status", None)
    task = Task.objects.create(
        project=project,
        reporter=reporter,
        key=next_task_key(project),
        status=TaskStatus.TODO,
        **fields,
    )
    record_creation(task, actor=reporter)
    return task

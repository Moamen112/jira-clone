from django.db import transaction

from projects.models import Project


@transaction.atomic
def next_task_key(project: Project) -> str:
    locked = Project.objects.select_for_update().get(pk=project.pk)
    locked.task_counter += 1
    locked.save(update_fields=["task_counter"])
    return f"{locked.key}-{locked.task_counter}"

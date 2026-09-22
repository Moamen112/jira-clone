from django.db.models import QuerySet

from projects.models import Project
from tasks.models import TaskType

TASK_TYPES_DEFAULT_LIMIT = 5


def seed_default_task_types(project: Project) -> list[TaskType]:
    return TaskType.objects.bulk_create(
        [
            TaskType(project=project, name=name)
            for name in ("Bug", "Feature", "Task", "Improvement")
        ],
        ignore_conflicts=True,
    )


def normalize_type_name(value: str) -> str:
    return value.strip()


def types_named(queryset: QuerySet[TaskType], name: str) -> QuerySet[TaskType]:
    normalized = normalize_type_name(name)
    if not normalized:
        return queryset.none()
    return queryset.filter(name__iexact=normalized)


def find_type_by_name(project: Project, name: str) -> TaskType | None:
    return types_named(project.task_types, name).first()

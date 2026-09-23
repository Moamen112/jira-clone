from django.db.models import Count, Q
from django.utils import timezone

from projects.models import Project, ProjectStatus
from tasks.models import Task, TaskStatus

RECENT_TASKS_DEFAULT = 10


def build_user_dashboard(
    *,
    user,
    limit: int = RECENT_TASKS_DEFAULT,
    created_after=None,
    created_before=None,
) -> dict:
    tasks = Task.objects.filter(project__memberships__user=user)
    if created_after is not None:
        tasks = tasks.filter(created_at__gte=created_after)
    if created_before is not None:
        tasks = tasks.filter(created_at__lte=created_before)

    recent_tasks = (
        tasks.filter(assignee=user)
        .select_related("project", "type", "reporter", "assignee")
        .order_by("-created_at")[:limit]
    )

    return {
        "stats": {**_project_stats(user), **_task_stats(tasks, user)},
        "recent_tasks": recent_tasks,
    }


def _project_stats(user) -> dict:
    return Project.objects.filter(memberships__user=user).aggregate(
        active_projects=Count("pk", filter=Q(status=ProjectStatus.ACTIVE), distinct=True)
    )


def _task_stats(tasks, user) -> dict:
    assigned = Q(assignee=user)
    overdue = assigned & Q(due_date__lt=timezone.localdate()) & ~Q(status=TaskStatus.DONE)

    counts = tasks.aggregate(
        assigned_tasks=Count("pk", filter=assigned, distinct=True),
        reported_tasks=Count("pk", filter=Q(reporter=user), distinct=True),
        overdue_tasks=Count("pk", filter=overdue, distinct=True),
        **{
            f"status_{status}": Count("pk", filter=assigned & Q(status=status), distinct=True)
            for status in TaskStatus.values
        },
    )

    return {
        "assigned_tasks": counts["assigned_tasks"],
        "reported_tasks": counts["reported_tasks"],
        "overdue_tasks": counts["overdue_tasks"],
        "tasks_by_status": {status: counts[f"status_{status}"] for status in TaskStatus.values},
    }

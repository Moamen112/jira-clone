from django.db.models import Count, Q

from tasks.models import TaskStatus


def open_task_count(relation: str = "tasks") -> Count:
    return Count(relation, filter=~Q(**{f"{relation}__status": TaskStatus.DONE}), distinct=True)

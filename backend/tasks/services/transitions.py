from rest_framework.exceptions import ValidationError

from tasks.models import TaskStatus


def allowed_statuses_for(task, user) -> set[str]:
    if user is None or not getattr(user, "is_authenticated", False):
        return set()

    allowed: set[str] = set()
    if task.is_reporter(user):
        allowed |= {TaskStatus.TODO, TaskStatus.DONE}
    if task.is_assignee(user):
        allowed |= {TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.QA_REVIEW}
    return allowed


def sorted_allowed_statuses(task, user) -> list[str]:
    allowed = allowed_statuses_for(task, user)
    return [status for status in TaskStatus.values if status in allowed]


def assert_can_transition(task, user, new_status: str) -> None:
    if new_status == task.status:
        return

    allowed = sorted_allowed_statuses(task, user)
    if new_status in allowed:
        return

    if allowed:
        detail = f"You cannot move this task to {new_status}. You may set: {', '.join(allowed)}."
    else:
        detail = (
            "Only the reporter or the assignee of a task can change its status. You are neither."
        )
    raise ValidationError({"status": [detail], "allowed_statuses": allowed})

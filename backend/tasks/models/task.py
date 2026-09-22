from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class TaskStatus(models.TextChoices):
    TODO = "todo", "To Do"
    IN_PROGRESS = "in_progress", "In Progress"
    IN_REVIEW = "in_review", "In Review"
    QA_REVIEW = "qa_review", "QA Review"
    DONE = "done", "Done"


class Task(TimeStampedModel):
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="tasks")
    key = models.CharField(
        max_length=20, editable=False, help_text="Human-readable identifier, e.g. SHOP-14."
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.ForeignKey("tasks.TaskType", on_delete=models.PROTECT, related_name="tasks")
    status = models.CharField(max_length=15, choices=TaskStatus.choices, default=TaskStatus.TODO)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reported_tasks"
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    due_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["project", "key"], name="uniq_task_key_per_project"),
        ]
        indexes = [
            models.Index(fields=["project", "status"], name="task_project_status_idx"),
            models.Index(fields=["project", "assignee"], name="task_project_assignee_idx"),
            models.Index(fields=["project", "type"], name="task_project_type_idx"),
            models.Index(fields=["project", "-created_at"], name="task_project_created_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.key} {self.title}"

    def is_reporter(self, user) -> bool:
        return bool(user and user.is_authenticated and self.reporter_id == user.id)

    def is_assignee(self, user) -> bool:
        return bool(
            user and user.is_authenticated and self.assignee_id and self.assignee_id == user.id
        )

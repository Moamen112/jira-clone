from django.conf import settings
from django.db import models


class TaskActivityAction(models.TextChoices):
    CREATED = "created", "Created"
    UPDATED = "updated", "Updated"
    COMMENTED = "commented", "Commented"
    COMMENT_DELETED = "comment_deleted", "Comment deleted"


class TaskActivity(models.Model):
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="activity")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, # this is a reference to the user model defined in the Django settings
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="task_activity",
    )
    comment = models.ForeignKey(
        "tasks.Comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="activity",
    )
    action = models.CharField(max_length=20, choices=TaskActivityAction.choices)
    field = models.CharField(max_length=30, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["task", "-created_at"], name="activity_task_created_idx")]
        verbose_name_plural = "task activity"

    def __str__(self) -> str:
        return f"{self.action} on {self.task_id}"

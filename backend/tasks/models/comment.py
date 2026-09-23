from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Comment(TimeStampedModel):
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="comments"
    )
    body = models.TextField()
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["task", "created_at"], name="comment_task_created_idx")]

    def __str__(self) -> str:
        return f"Comment {self.pk} on {self.task_id}"

    @property
    def project(self):
        return self.task.project

    @property
    def is_edited(self) -> bool:
        return self.edited_at is not None

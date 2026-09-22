from django.db import models
from django.db.models.functions import Lower


class TaskType(models.Model):
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="task_types"
    )
    name = models.CharField(max_length=50)
    is_active = models.BooleanField(
        default=True, help_text="Inactive types cannot be chosen for new tasks."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "project", name="uniq_task_type_name_per_project"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.project_id}:{self.name}"

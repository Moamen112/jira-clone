from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

from common.models import TimeStampedModel

ARCHIVED_MESSAGE = "This project is archived and read-only."


class ProjectStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    DONE = "done", "Done"
    ARCHIVED = "archived", "Archived"


class Project(TimeStampedModel):
    name = models.CharField(max_length=120)
    key = models.CharField(
        max_length=10,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Za-z][A-Za-z0-9]{1,9}$",
                message="Key must be 2-10 letters or digits and start with a letter.",
            )
        ],
        help_text="Short uppercase code used as the task key prefix, e.g. SHOP.",
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=10, choices=ProjectStatus.choices, default=ProjectStatus.ACTIVE
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_projects"
    )
    task_counter = models.PositiveIntegerField(default=0, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"])]

    def __str__(self) -> str:
        return f"{self.key} - {self.name}"

    @property
    def is_archived(self) -> bool:
        return self.status == ProjectStatus.ARCHIVED

    def is_owned_by(self, user) -> bool:
        return bool(user and user.is_authenticated and self.owner_id == user.id)

    def has_member(self, user) -> bool:
        if not user or not user.is_authenticated:
            return False
        return self.memberships.filter(user_id=user.id).exists()

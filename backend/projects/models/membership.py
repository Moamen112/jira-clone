from django.conf import settings
from django.db import models


class MembershipRole(models.TextChoices):
    OWNER = "owner", "Owner"
    MEMBER = "member", "Member"


class ProjectMembership(models.Model):
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(
        max_length=10, choices=MembershipRole.choices, default=MembershipRole.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["role", "joined_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["project", "user"], name="uniq_membership_per_project_user"
            ),
            models.UniqueConstraint(
                fields=["project"],
                condition=models.Q(role=MembershipRole.OWNER),
                name="uniq_single_owner_per_project",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user_id}@{self.project_id} ({self.role})"

    @property
    def is_owner(self) -> bool:
        return self.role == MembershipRole.OWNER

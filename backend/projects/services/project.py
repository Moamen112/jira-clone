from collections import Counter

from django.db import transaction
from rest_framework.exceptions import ValidationError

from projects.models import MembershipRole, Project, ProjectMembership
from users.models import User


def listed(ids) -> str:
    return ", ".join(str(pk) for pk in sorted(ids))


def resolve_users(ids: list[int]) -> list[User]:
    repeated = [pk for pk, seen in Counter(ids).items() if seen > 1]
    if repeated:
        raise ValidationError(f"Repeated in this request: {listed(repeated)}.")

    found = {user.pk: user for user in User.objects.filter(pk__in=ids)}
    missing = [pk for pk in ids if pk not in found]
    if missing:
        noun = "id" if len(missing) == 1 else "ids"
        raise ValidationError(f"There is no user with {noun} {listed(missing)}.")

    return [found[pk] for pk in ids]


@transaction.atomic
def create_project(*, owner, members=(), **fields) -> Project:
    project = Project.objects.create(owner=owner, **fields)
    ProjectMembership.objects.create(project=project, user=owner, role=MembershipRole.OWNER)
    if members:
        add_members(project=project, users=members)
    return project


@transaction.atomic
def add_members(*, project: Project, users) -> list[ProjectMembership]:
    already = set(
        ProjectMembership.objects.filter(project=project, user__in=users).values_list(
            "user_id", flat=True
        )
    )
    if already:
        listed = ", ".join(str(pk) for pk in sorted(already))
        raise ValidationError({"users": [f"Already a member of this project: {listed}."]})

    return ProjectMembership.objects.bulk_create(
        [
            ProjectMembership(project=project, user=user, role=MembershipRole.MEMBER)
            for user in users
        ]
    )


@transaction.atomic
def delete_project(project: Project) -> None:
    project.tasks.all().delete()
    project.delete()


def remove_member(membership: ProjectMembership) -> None:
    if membership.is_owner:
        raise ValidationError(
            {"detail": ["The project owner cannot be removed. Transfer ownership first."]}
        )
    membership.delete()

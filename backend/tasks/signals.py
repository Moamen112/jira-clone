from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from projects.models import Project, ProjectMembership
from tasks.models import Task
from tasks.services import record_unassignment, seed_default_task_types


@receiver(post_save, sender=Project, dispatch_uid="seed_default_task_types")
def seed_task_types_for_new_project(sender, instance: Project, created: bool, **kwargs) -> None:
    if created:
        seed_default_task_types(instance)


@receiver(post_delete, sender=ProjectMembership, dispatch_uid="unassign_removed_member")
def unassign_tasks_of_removed_member(sender, instance: ProjectMembership, **kwargs) -> None:
    affected = Task.objects.filter(project_id=instance.project_id, assignee_id=instance.user_id)
    task_ids = list(affected.values_list("id", flat=True))
    if not task_ids:
        return

    affected.update(assignee=None)
    record_unassignment(task_ids, instance.user)

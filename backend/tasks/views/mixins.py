from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from tasks.models import Task

TASK_NOT_FOUND = "No task with this id, or it belongs to a project you are not a member of."


class TaskScopedViewSetMixin:
    task_url_kwarg = "task_pk"

    @property
    def task(self) -> Task:
        if not hasattr(self, "_task"):
            visible = Task.objects.filter(
                project__memberships__user=self.request.user
            ).select_related("project")
            try:
                self._task = get_object_or_404(visible, pk=self.kwargs[self.task_url_kwarg])
            except Http404:
                raise NotFound(TASK_NOT_FOUND) from None
        return self._task

    @property
    def project(self):
        return self.task.project

from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from projects.models import Project

PROJECT_NOT_FOUND = "No project with this id, or you are not a member of it."


class ProjectScopedViewSetMixin:
    project_url_kwarg = "project_pk"

    @property
    def project(self) -> Project:
        if not hasattr(self, "_project"):
            visible = Project.objects.filter(memberships__user=self.request.user)
            try:
                self._project = get_object_or_404(visible, pk=self.kwargs[self.project_url_kwarg])
            except Http404:
                raise NotFound(PROJECT_NOT_FOUND) from None
        return self._project

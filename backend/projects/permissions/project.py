from rest_framework.permissions import SAFE_METHODS, BasePermission

from projects.models import ARCHIVED_MESSAGE, Project, ProjectStatus


def project_of(obj) -> Project:
    return obj if isinstance(obj, Project) else obj.project


class IsProjectOwnerOrReadOnly(BasePermission):
    message = "Only the project owner can perform this action."

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        project = getattr(view, "project", None)
        return project is None or project.is_owned_by(request.user)

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return project_of(obj).is_owned_by(request.user)


class ProjectNotArchived(BasePermission):
    message = ARCHIVED_MESSAGE

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        project = getattr(view, "project", None)
        return project is None or not project.is_archived

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True

        project = project_of(obj)
        if not project.is_archived:
            return True

        return (
            isinstance(obj, Project)
            and request.method == "PATCH"
            and project.is_owned_by(request.user)
            and set(request.data.keys()) == {"status"}
            and request.data.get("status") != ProjectStatus.ARCHIVED
        )

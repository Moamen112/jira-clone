from rest_framework.permissions import SAFE_METHODS, BasePermission


class CanModifyTask(BasePermission):
    message = "Only the reporter can edit this task; the assignee may only change its status."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        if request.method == "DELETE":
            return obj.is_reporter(user) or obj.project.is_owned_by(user)

        if obj.is_reporter(user):
            return True

        if obj.is_assignee(user):
            return set(request.data.keys()) <= {"status"}

        return False

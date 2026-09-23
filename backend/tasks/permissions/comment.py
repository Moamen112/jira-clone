from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsCommentAuthor(BasePermission):
    message = "Only the author can edit or delete this comment."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return obj.author_id == request.user.id

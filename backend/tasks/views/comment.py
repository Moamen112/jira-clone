from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.views import FriendlyNotFoundMixin
from projects.permissions import ProjectNotArchived
from tasks.models import Comment
from tasks.permissions import IsCommentAuthor
from tasks.serializers import CommentSerializer
from tasks.services import create_comment, delete_comment, edit_comment

from .mixins import TaskScopedViewSetMixin


class CommentViewSet(FriendlyNotFoundMixin, TaskScopedViewSetMixin, viewsets.ModelViewSet):
    not_found_message = "This task has no comment with that id."
    pagination_class = None
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentAuthor, ProjectNotArchived]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filter_backends = []

    def get_queryset(self) -> QuerySet[Comment]:
        return Comment.objects.filter(task=self.task).select_related("author", "task__project")

    def perform_create(self, serializer) -> None:
        serializer.instance = create_comment(
            task=self.task, author=self.request.user, body=serializer.validated_data["body"]
        )

    def perform_update(self, serializer) -> None:
        serializer.instance = edit_comment(serializer.instance, serializer.validated_data["body"])

    def perform_destroy(self, instance: Comment) -> None:
        delete_comment(instance, actor=self.request.user)

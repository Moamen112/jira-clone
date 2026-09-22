from django.db.models import Count, QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.views import FriendlyNotFoundMixin
from projects.permissions import ProjectNotArchived
from tasks.filters import TaskFilter
from tasks.models import Task
from tasks.permissions import CanModifyTask
from tasks.serializers import TaskDetailSerializer, TaskListSerializer, TaskWriteSerializer
from tasks.services import create_task
from tasks.views.mixins import TASK_NOT_FOUND


class TaskViewSet(FriendlyNotFoundMixin, viewsets.ModelViewSet):
    not_found_message = TASK_NOT_FOUND
    pagination_class = None
    permission_classes = [IsAuthenticated, CanModifyTask, ProjectNotArchived]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filterset_class = TaskFilter
    search_fields = ["title", "description", "key"]
    ordering_fields = ["created_at", "updated_at", "due_date", "status", "title", "key"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[Task]:
        queryset = Task.objects.filter(project__memberships__user=self.request.user).select_related(
            "project", "type", "reporter", "assignee"
        )
        if self.action == "retrieve":
            queryset = queryset.annotate(
                comment_count=Count("comments", distinct=True),
                activity_count=Count("activity", distinct=True),
            )
        return queryset

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return TaskWriteSerializer
        if self.action == "list":
            return TaskListSerializer
        return TaskDetailSerializer

    def perform_create(self, serializer) -> None:
        data = dict(serializer.validated_data)
        project = data.pop("project")
        serializer.instance = create_task(project=project, reporter=self.request.user, **data)

from django.db.models import Count, ProtectedError, QuerySet
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from common.views import FriendlyNotFoundMixin
from projects.permissions import IsProjectOwnerOrReadOnly, ProjectNotArchived
from projects.views import ProjectScopedViewSetMixin
from tasks.filters import TaskTypeFilter
from tasks.models import TaskType
from tasks.serializers import TaskTypeQuerySerializer, TaskTypeSerializer


class TaskTypeViewSet(FriendlyNotFoundMixin, ProjectScopedViewSetMixin, viewsets.ModelViewSet):
    not_found_message = "This project has no task type with that id."
    pagination_class = None
    serializer_class = TaskTypeSerializer
    permission_classes = [IsAuthenticated, IsProjectOwnerOrReadOnly, ProjectNotArchived]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filterset_class = TaskTypeFilter
    search_fields = ["name"]
    ordering_fields = ["name", "created_at", "task_count"]
    ordering = ["name"]

    def get_queryset(self) -> QuerySet[TaskType]:
        return (
            TaskType.objects.filter(project=self.project)
            .select_related("project")
            .annotate(task_count=Count("tasks"))
        )

    def filter_queryset(self, queryset: QuerySet[TaskType]) -> QuerySet[TaskType]:
        queryset = super().filter_queryset(queryset)
        if self.action != "list":
            return queryset

        params = TaskTypeQuerySerializer(data=self.request.query_params)
        params.is_valid(raise_exception=True)
        limit = params.validated_data["limit"]
        return queryset if limit is None else queryset[:limit]

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        if self.request.user.is_authenticated and self.kwargs.get(self.project_url_kwarg):
            context["project"] = self.project
        return context

    def perform_create(self, serializer) -> None:
        serializer.save(project=self.project)
        serializer.instance = self.get_queryset().get(pk=serializer.instance.pk)

    def perform_destroy(self, instance: TaskType) -> None:
        try:
            instance.delete()
        except ProtectedError as exc:
            raise ValidationError(
                {
                    "detail": [
                        "This task type is used by existing tasks. "
                        "Set is_active to false instead of deleting it."
                    ]
                }
            ) from exc

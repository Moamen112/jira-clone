from django.db.models import Count, Prefetch, QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.views import FriendlyNotFoundMixin
from projects.filters import ProjectFilter
from projects.models import Project, ProjectMembership
from projects.permissions import IsProjectOwnerOrReadOnly, ProjectNotArchived
from projects.serializers import (
    ProjectDetailSerializer,
    ProjectListSerializer,
    ProjectWriteSerializer,
)
from projects.services import create_project, delete_project
from projects.views.mixins import PROJECT_NOT_FOUND
from tasks.services import open_task_count


class ProjectViewSet(FriendlyNotFoundMixin, viewsets.ModelViewSet):
    not_found_message = PROJECT_NOT_FOUND
    permission_classes = [IsAuthenticated, IsProjectOwnerOrReadOnly, ProjectNotArchived]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filterset_class = ProjectFilter
    search_fields = ["name", "key", "description"]
    ordering_fields = [
        "created_at",
        "updated_at",
        "name",
        "key",
        "status",
        "task_count",
        "open_task_count",
    ]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[Project]:
        queryset = (
            Project.objects.filter(memberships__user=self.request.user)
            .select_related("owner")
            .annotate(
                task_count=Count("tasks", distinct=True),
                open_task_count=open_task_count(),
            )
        )
        if self.action == "retrieve":
            queryset = queryset.prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=ProjectMembership.objects.select_related("user"),
                ),
                "tasks__type",
                "tasks__reporter",
                "tasks__assignee",
                "task_types",
            )
        return queryset

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProjectWriteSerializer
        if self.action == "list":
            return ProjectListSerializer
        return ProjectDetailSerializer

    def perform_create(self, serializer) -> None:
        serializer.instance = create_project(owner=self.request.user, **serializer.validated_data)

    def perform_destroy(self, instance: Project) -> None:
        delete_project(instance)

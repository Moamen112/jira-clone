from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.views import FriendlyNotFoundMixin
from tasks.filters import TaskActivityFilter
from tasks.models import TaskActivity
from tasks.serializers import TaskActivitySerializer

from .mixins import TaskScopedViewSetMixin


class TaskActivityViewSet(
    FriendlyNotFoundMixin, TaskScopedViewSetMixin, viewsets.ReadOnlyModelViewSet
):
    not_found_message = "This task has no activity entry with that id."
    pagination_class = None
    serializer_class = TaskActivitySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "head", "options"]
    filterset_class = TaskActivityFilter
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[TaskActivity]:
        return TaskActivity.objects.filter(task=self.task).select_related(
            "actor", "comment", "comment__author"
        )

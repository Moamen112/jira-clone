from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from common.views import FriendlyNotFoundMixin
from projects.models import ProjectMembership
from projects.permissions import IsProjectOwnerOrReadOnly, ProjectNotArchived
from projects.serializers import MembershipSerializer, MembershipWriteSerializer
from projects.services import add_members, remove_member

from .mixins import ProjectScopedViewSetMixin


class MembershipViewSet(FriendlyNotFoundMixin, ProjectScopedViewSetMixin, viewsets.ModelViewSet):
    not_found_message = "This project has no member with that user id."
    pagination_class = None
    permission_classes = [IsAuthenticated, IsProjectOwnerOrReadOnly, ProjectNotArchived]
    http_method_names = ["get", "post", "delete", "head", "options"]
    lookup_field = "user_id"
    lookup_value_regex = r"\d+"
    filterset_fields = ["role"]
    search_fields = ["user__email", "user__full_name"]
    ordering_fields = ["joined_at", "role"]
    ordering = ["role", "joined_at"]

    def get_queryset(self) -> QuerySet[ProjectMembership]:
        return ProjectMembership.objects.filter(project=self.project).select_related(
            "user", "project"
        )

    def get_serializer_class(self):
        return MembershipWriteSerializer if self.action == "create" else MembershipSerializer

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        members = add_members(project=self.project, users=serializer.validated_data["users"])
        return Response(
            MembershipSerializer(members, many=True).data, status=status.HTTP_201_CREATED
        )

    def perform_destroy(self, instance: ProjectMembership) -> None:
        remove_member(instance)

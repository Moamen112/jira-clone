from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.request import Request
from rest_framework.response import Response

from tasks.serializers import DashboardQuerySerializer, DashboardSerializer
from tasks.services import build_user_dashboard
from users.filters import UserFilter
from users.models import User
from users.serializers import MeSerializer, UserSerializer

SERIALIZERS = {"me": MeSerializer, "dashboard": DashboardSerializer}


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    filterset_class = UserFilter
    search_fields = ["email", "full_name"]
    ordering_fields = ["email", "full_name", "created_at"]
    ordering = ["id"]

    def get_queryset(self):
        return User.objects.distinct()

    def get_serializer_class(self):
        return SERIALIZERS.get(self.action, UserSerializer)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        raise MethodNotAllowed(request.method)

    @action(detail=False, methods=["get", "patch"])
    def me(self, request: Request) -> Response:
        if request.method == "PATCH":
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response(self.get_serializer(request.user).data)

    @action(detail=False, methods=["get"], url_path="me/dashboard")
    def dashboard(self, request: Request) -> Response:
        params = DashboardQuerySerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        payload = build_user_dashboard(user=request.user, **params.validated_data)
        return Response(self.get_serializer(payload).data)

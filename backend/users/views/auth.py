from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    TOTPVerifySerializer,
)
from users.services import TOTPPendingToken, verify_code


class RegisterViewSet(viewsets.ModelViewSet):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    http_method_names = ["post"]


class LoginViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    http_method_names = ["post"]

    def get_serializer_class(self):
        return TOTPVerifySerializer if self.action == "verify" else LoginSerializer

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

    @action(detail=False, methods=["post"], url_path="verify")
    def verify(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            pending = TOTPPendingToken(serializer.validated_data["pending_token"])
        except TokenError as exc:
            raise AuthenticationFailed("This login has expired. Sign in again.") from exc

        user = User.objects.get(pk=pending["user_id"])
        if not verify_code(user, serializer.validated_data["code"]):
            return Response(
                {"code": ["That code is not valid."]}, status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)
        return Response({"refresh": str(refresh), "access": str(refresh.access_token)})


class LogoutViewSet(viewsets.ModelViewSet):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["post"]

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RefreshViewSet(viewsets.ModelViewSet):
    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]
    http_method_names = ["post"]

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise AuthenticationFailed(exc.args[0]) from exc
        return Response(serializer.validated_data)

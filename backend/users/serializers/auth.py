from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.services import (
    InvalidRefreshToken,
    TOTPPendingToken,
    blacklist_refresh_token,
    provisioning_uri,
    secret_for,
)


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict) -> dict:
        super().validate(attrs)

        pending = {"pending_token": str(TOTPPendingToken.for_user(self.user))}
        if self.user.is_totp_linked:
            return {"status": "otp_required", **pending}

        return {
            "status": "totp_setup_required",
            "secret": secret_for(self.user),
            "otpauth_uri": provisioning_uri(self.user),
            **pending,
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate_refresh(self, value: str) -> str:
        try:
            blacklist_refresh_token(value, self.context["request"].user)
        except InvalidRefreshToken:
            raise serializers.ValidationError("That refresh token is not valid.") from None
        return value

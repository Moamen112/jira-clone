from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed as JWTAuthenticationFailed
from rest_framework_simplejwt.exceptions import ExpiredTokenError, TokenError
from rest_framework_simplejwt.settings import api_settings

BAD_AUTH_HEADER = "The Authorization header must read: Bearer <access token>."
ACCESS_TOKEN_EXPIRED = "Your access token has expired. Refresh it, or sign in again."
TOKEN_INVALID = "That token is not valid."


class FriendlyJWTAuthentication(JWTAuthentication):
    def get_raw_token(self, header: bytes) -> bytes | None:
        try:
            return super().get_raw_token(header)
        except JWTAuthenticationFailed:
            raise AuthenticationFailed(BAD_AUTH_HEADER) from None

    def get_validated_token(self, raw_token: bytes):
        for token_class in api_settings.AUTH_TOKEN_CLASSES:
            try:
                return token_class(raw_token)
            except ExpiredTokenError:
                raise AuthenticationFailed(ACCESS_TOKEN_EXPIRED) from None
            except TokenError:
                continue
        raise AuthenticationFailed(TOKEN_INVALID)

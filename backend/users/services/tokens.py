from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken


class InvalidRefreshToken(Exception):
    pass


def blacklist_refresh_token(raw_token: str, user) -> None:
    try:
        token = RefreshToken(raw_token)
    except TokenError as exc:
        raise InvalidRefreshToken from exc

    if str(token.get(api_settings.USER_ID_CLAIM)) != str(user.id):
        raise InvalidRefreshToken

    token.blacklist()

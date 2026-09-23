from datetime import timedelta

import pyotp
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken


class TOTPPendingToken(AccessToken):
    token_type = "totp_pending"
    lifetime = timedelta(minutes=5)


def secret_for(user) -> str:
    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save(update_fields=["totp_secret"])
    return user.totp_secret


def provisioning_uri(user) -> str:
    return pyotp.TOTP(secret_for(user)).provisioning_uri(
        name=user.email, issuer_name=settings.TOTP_ISSUER
    )


def verify_code(user, code: str) -> bool:
    if not code or not user.totp_secret:
        return False

    if not pyotp.TOTP(user.totp_secret).verify(code, valid_window=0):
        return False

    if user.totp_confirmed_at is None:
        user.totp_confirmed_at = timezone.now()
        user.save(update_fields=["totp_confirmed_at"])
    return True

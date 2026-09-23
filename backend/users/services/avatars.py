from pathlib import Path
from uuid import uuid4

from django.conf import settings
from rest_framework.exceptions import ValidationError

ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}
TOO_LARGE = "This image is {size} KB. The limit is {limit} KB."
WRONG_TYPE = "Upload a JPEG, PNG or WEBP image."


def avatar_upload_path(instance, filename: str) -> str:
    return f"avatars/{uuid4().hex}{Path(filename).suffix.lower()}"


def validate_avatar(image):
    if image.size > settings.MAX_AVATAR_BYTES:
        raise ValidationError(
            TOO_LARGE.format(size=image.size // 1024, limit=settings.MAX_AVATAR_BYTES // 1024)
        )
    if getattr(image, "content_type", None) not in ALLOWED_AVATAR_TYPES:
        raise ValidationError(WRONG_TYPE)
    return image


def discard_avatar(user) -> None:
    if user.avatar:
        user.avatar.delete(save=False)

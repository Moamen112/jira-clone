from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from common.models import TimeStampedModel
from users.services import avatar_upload_path

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=100, blank=True, default="")
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, default="")
    is_staff = models.BooleanField(default=False)

    totp_secret = models.CharField(max_length=32, blank=True, default="", editable=False)
    totp_confirmed_at = models.DateTimeField(null=True, blank=True, editable=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.email

    def save(self, *args, **kwargs):
        self.email = self.email.lower()
        return super().save(*args, **kwargs)

    @property
    def is_totp_linked(self) -> bool:
        return bool(self.totp_secret and self.totp_confirmed_at)

    def get_full_name(self) -> str:
        return self.full_name

    def get_short_name(self) -> str:
        return self.full_name.split(" ")[0] if self.full_name else self.email

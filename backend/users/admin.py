from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "full_name", "job_title", "is_staff", "is_totp_linked", "created_at"]
    list_filter = ["is_staff", "is_superuser"]
    readonly_fields = ["totp_confirmed_at", "last_login", "created_at", "updated_at"]
    search_fields = ["email", "full_name", "job_title"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "job_title", "avatar")}),
        (
            "Permissions",
            {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Two-factor", {"fields": ("totp_confirmed_at",)}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "job_title", "password1", "password2"),
            },
        ),
    )

    @admin.display(boolean=True, description="2FA linked")
    def is_totp_linked(self, obj: User) -> bool:
        return obj.is_totp_linked

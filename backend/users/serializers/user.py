from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from common.serializers import UpdateChangedFieldsMixin
from users.models import User
from users.services import discard_avatar, validate_avatar


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "job_title", "avatar"]
        read_only_fields = fields


class MeSerializer(UpdateChangedFieldsMixin, serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "job_title", "avatar", "created_at", "updated_at"]
        read_only_fields = ["id", "email", "created_at", "updated_at"]

    def validate_avatar(self, value):
        return value if value is None else validate_avatar(value)

    def update(self, instance: User, validated_data: dict) -> User:
        if "avatar" in validated_data:
            discard_avatar(instance)
            validated_data["avatar"] = validated_data["avatar"] or ""
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)

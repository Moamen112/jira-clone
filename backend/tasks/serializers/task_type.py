from rest_framework import serializers

from common.serializers import UpdateChangedFieldsMixin
from tasks.models import TaskType
from tasks.services import (
    TASK_TYPES_DEFAULT_LIMIT,
    find_type_by_name,
    normalize_type_name,
)

EVERY = "all"
LIMIT_INVALID = f'Use a whole number of rows, or "{EVERY}" for every type.'


class TaskTypeSerializer(UpdateChangedFieldsMixin, serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TaskType
        fields = ["id", "project", "name", "is_active", "task_count", "created_at"]
        read_only_fields = ["id", "project", "task_count", "created_at"]

    def validate_name(self, value: str) -> str:
        value = normalize_type_name(value)
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")

        project = self.context.get("project") or getattr(self.instance, "project", None)
        if project is None:
            return value

        clash = find_type_by_name(project, value)
        if clash is not None and clash.pk != getattr(self.instance, "pk", None):
            raise serializers.ValidationError(
                "This project already has a task type with that name."
            )
        return value


class TaskTypeQuerySerializer(serializers.Serializer):
    limit = serializers.CharField(required=False, default=str(TASK_TYPES_DEFAULT_LIMIT))

    def validate_limit(self, value: str) -> int | None:
        value = value.strip().lower()
        if value == EVERY:
            return None
        try:
            rows = int(value)
        except ValueError:
            raise serializers.ValidationError(LIMIT_INVALID) from None
        if rows < 0:
            raise serializers.ValidationError("Ensure this value is greater than or equal to 0.")
        return rows


class TaskTypeBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskType
        fields = ["id", "name", "is_active"]
        read_only_fields = fields

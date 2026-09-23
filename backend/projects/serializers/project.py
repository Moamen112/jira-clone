from rest_framework import serializers

from common.serializers import UpdateChangedFieldsMixin
from projects.models import Project, ProjectStatus
from projects.services import resolve_users
from users.serializers import UserSerializer

from .membership import MembershipSerializer

MEMBERS_ON_UPDATE = "Members are added and removed at /api/projects/{id}/members/, not here."


class ProjectBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "key", "name", "status"]
        read_only_fields = fields


class _ProjectBaseSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    task_count = serializers.IntegerField(read_only=True)
    open_task_count = serializers.IntegerField(read_only=True)


class ProjectListSerializer(_ProjectBaseSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "key",
            "description",
            "status",
            "owner",
            "task_count",
            "open_task_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ProjectDetailSerializer(_ProjectBaseSerializer):
    members = MembershipSerializer(source="memberships", many=True, read_only=True)
    task_types = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "key",
            "description",
            "status",
            "owner",
            "members",
            "task_types",
            "tasks",
            "task_count",
            "open_task_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_task_types(self, obj: Project) -> list[dict]:
        from tasks.serializers import TaskTypeBriefSerializer

        return TaskTypeBriefSerializer(obj.task_types.all(), many=True).data

    def get_tasks(self, obj: Project) -> list[dict]:
        from tasks.serializers import TaskInProjectSerializer

        return TaskInProjectSerializer(obj.tasks.all(), many=True, context=self.context).data


class ProjectWriteSerializer(UpdateChangedFieldsMixin, serializers.ModelSerializer):
    members = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = ["id", "name", "key", "description", "status", "members"]
        read_only_fields = ["id"]

    def to_internal_value(self, data):
        key = data.get("key") if hasattr(data, "get") else None
        if isinstance(key, str):
            data = data.copy()
            data["key"] = key.strip().upper()
        return super().to_internal_value(data)

    def validate_key(self, value: str) -> str:
        if self.instance and self.instance.key != value:
            raise serializers.ValidationError("The project key cannot be changed after creation.")
        return value

    def validate_members(self, value: list[int]):
        if self.instance is not None:
            raise serializers.ValidationError(MEMBERS_ON_UPDATE)
        caller = self.context["request"].user
        return [user for user in resolve_users(value) if user.pk != caller.pk]

    def validate_status(self, value: str) -> str:
        if self.instance is None and value != ProjectStatus.ACTIVE:
            raise serializers.ValidationError("New projects always start as ACTIVE.")
        return value

    def to_representation(self, instance: Project) -> dict:
        data = super().to_representation(instance)
        data["members"] = MembershipSerializer(
            instance.memberships.select_related("user"), many=True
        ).data
        return data

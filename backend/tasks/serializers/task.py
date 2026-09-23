from rest_framework import serializers

from common.serializers import UpdateChangedFieldsMixin
from projects.models import Project
from projects.serializers import ProjectBriefSerializer
from tasks.models import Task, TaskType
from tasks.services import (
    assert_can_transition,
    diff_task,
    record_changes,
    sorted_allowed_statuses,
)
from users.models import User
from users.serializers import UserSerializer

from .task_type import TaskTypeBriefSerializer

TYPE_NOT_IN_PROJECT = "There is no task type with id {pk_value} in this project."

TASK_FIELDS = [
    "id",
    "key",
    "title",
    "type",
    "status",
    "reporter",
    "assignee",
    "due_date",
    "allowed_statuses",
    "created_at",
    "updated_at",
]


class TaskInProjectSerializer(serializers.ModelSerializer):
    type = TaskTypeBriefSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    allowed_statuses = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = TASK_FIELDS
        read_only_fields = fields

    def get_allowed_statuses(self, obj: Task) -> list[str]:
        request = self.context.get("request")
        return sorted_allowed_statuses(obj, request.user) if request else []


class TaskListSerializer(TaskInProjectSerializer):
    project = ProjectBriefSerializer(read_only=True)

    class Meta(TaskInProjectSerializer.Meta):
        fields = [*TASK_FIELDS, "project"]
        read_only_fields = fields


class TaskSerializer(TaskListSerializer):
    class Meta(TaskListSerializer.Meta):
        fields = [*TASK_FIELDS, "project", "description"]
        read_only_fields = fields


class TaskDetailSerializer(TaskSerializer):
    comment_count = serializers.IntegerField(read_only=True)
    activity_count = serializers.IntegerField(read_only=True)

    class Meta(TaskSerializer.Meta):
        fields = [*TaskSerializer.Meta.fields, "comment_count", "activity_count"]
        read_only_fields = fields


class VisibleProjectField(serializers.PrimaryKeyRelatedField):
    default_error_messages = {
        "does_not_exist": "There is no project with id {pk_value}, or you are not a member of it.",
        "incorrect_type": "A project id must be a number.",
    }

    def get_queryset(self):
        return Project.objects.filter(memberships__user=self.context["request"].user)


class TaskWriteSerializer(UpdateChangedFieldsMixin, serializers.ModelSerializer):
    project = VisibleProjectField()
    type = serializers.PrimaryKeyRelatedField(
        queryset=TaskType.objects.all(),
        error_messages={
            "does_not_exist": TYPE_NOT_IN_PROJECT,
            "incorrect_type": "A task type id must be a number.",
        },
    )
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False,
        error_messages={
            "does_not_exist": "There is no user with id {pk_value}.",
            "incorrect_type": "A user id must be a number.",
        },
    )

    class Meta:
        model = Task
        fields = [
            "project",
            "title",
            "description",
            "type",
            "status",
            "assignee",
            "due_date",
        ]

    @property
    def _user(self):
        return self.context["request"].user

    def validate_project(self, value):
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("A task cannot be moved to another project.")
        return value

    def validate(self, attrs: dict) -> dict:
        project = attrs.get("project") or (self.instance.project if self.instance else None)

        errors: dict[str, list[str]] = {}

        task_type = attrs.get("type")
        if task_type is not None:
            if task_type.project_id != project.pk:
                errors["type"] = [TYPE_NOT_IN_PROJECT.format(pk_value=task_type.pk)]
            elif not task_type.is_active and (
                self.instance is None or self.instance.type_id != task_type.pk
            ):
                errors["type"] = ["This task type is inactive and cannot be assigned."]

        assignee = attrs.get("assignee")
        if assignee is not None and not project.has_member(assignee):
            errors["assignee"] = ["The assignee must be a member of the project."]

        if errors:
            raise serializers.ValidationError(errors)

        if self.instance is not None and "status" in attrs:
            assert_can_transition(self.instance, self._user, attrs["status"])

        return attrs

    def update(self, instance: Task, validated_data: dict) -> Task:
        changes = diff_task(instance, validated_data)
        instance = super().update(instance, validated_data)
        record_changes(instance, actor=self._user, changes=changes)
        return instance

    def to_representation(self, instance: Task) -> dict:
        return TaskSerializer(instance, context=self.context).data

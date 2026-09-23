from rest_framework import serializers

from tasks.services import RECENT_TASKS_DEFAULT

from .task import TaskListSerializer


class DashboardQuerySerializer(serializers.Serializer):
    limit = serializers.IntegerField(required=False, default=RECENT_TASKS_DEFAULT, min_value=0)
    created_after = serializers.DateTimeField(required=False)
    created_before = serializers.DateTimeField(required=False)

    def validate(self, attrs: dict) -> dict:
        after, before = attrs.get("created_after"), attrs.get("created_before")
        if after and before and after > before:
            raise serializers.ValidationError(
                {"created_after": ["This must not be later than created_before."]}
            )
        return attrs


class DashboardStatsSerializer(serializers.Serializer):
    active_projects = serializers.IntegerField(read_only=True)
    assigned_tasks = serializers.IntegerField(read_only=True)
    reported_tasks = serializers.IntegerField(read_only=True)
    overdue_tasks = serializers.IntegerField(read_only=True)
    tasks_by_status = serializers.DictField(child=serializers.IntegerField(), read_only=True)


class DashboardSerializer(serializers.Serializer):
    stats = DashboardStatsSerializer(read_only=True)
    recent_tasks = TaskListSerializer(many=True, read_only=True)

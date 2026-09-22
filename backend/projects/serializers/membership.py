from rest_framework import serializers

from projects.models import ProjectMembership
from projects.services import resolve_users
from users.serializers import UserSerializer


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ["user", "role", "joined_at"]
        read_only_fields = fields


class MembershipWriteSerializer(serializers.Serializer):
    users = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)

    def validate_users(self, value: list[int]):
        return resolve_users(value)

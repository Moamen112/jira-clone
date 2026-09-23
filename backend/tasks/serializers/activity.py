from rest_framework import serializers

from tasks.models import TaskActivity
from users.serializers import UserSerializer

from .comment import CommentSerializer


class TaskActivitySerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)

    class Meta:
        model = TaskActivity
        fields = [
            "id",
            "actor",
            "action",
            "field",
            "old_value",
            "new_value",
            "comment",
            "created_at",
        ]
        read_only_fields = fields

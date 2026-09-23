from rest_framework import serializers

from tasks.models import Comment
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_edited = serializers.BooleanField(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "body", "is_edited", "edited_at", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "is_edited", "edited_at", "created_at", "updated_at"]

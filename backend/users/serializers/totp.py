from rest_framework import serializers


class TOTPVerifySerializer(serializers.Serializer):
    pending_token = serializers.CharField(write_only=True)
    code = serializers.CharField(write_only=True, min_length=6, max_length=6)

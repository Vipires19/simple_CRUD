import mimetypes
import os
import uuid

from rest_framework import serializers

from .models import UserFile

MAX_BYTES = 10 * 1024 * 1024
ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".pdf", ".txt"}


def validate_upload_file(value):
    name = getattr(value, "name", "") or ""
    ext = os.path.splitext(name)[1].lower()
    if ext not in ALLOWED_EXT:
        raise serializers.ValidationError(
            "tipo não permitido; use .png, .jpg, .jpeg, .pdf ou .txt"
        )
    size = getattr(value, "size", None)
    if size is not None and size > MAX_BYTES:
        raise serializers.ValidationError("arquivo excede 10MB")
    return value


class UserFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFile
        fields = (
            "id",
            "original_name",
            "size",
            "content_type",
            "created_at",
        )
        read_only_fields = fields


class UserFileCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, validators=[validate_upload_file])

    class Meta:
        model = UserFile
        fields = ("file",)

    def create(self, validated_data):
        request = self.context["request"]
        upload = validated_data["file"]
        original_name = os.path.basename(upload.name)
        ext = os.path.splitext(original_name)[1].lower()
        storage_name = f"{uuid.uuid4().hex}{ext}"
        guessed, _ = mimetypes.guess_type(original_name)
        content_type = getattr(upload, "content_type", None) or guessed or ""
        instance = UserFile(
            user=request.user,
            original_name=original_name,
            storage_name=storage_name,
            content_type=content_type,
            size=getattr(upload, "size", 0) or 0,
        )
        instance.file.save(storage_name, upload, save=False)
        instance.save()
        return instance

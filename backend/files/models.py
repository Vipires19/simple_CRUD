from django.conf import settings
from django.db import models


def upload_path(instance, filename):
    return f"uploads/{instance.user_id}/{instance.storage_name}"


class UserFile(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_files",
    )
    original_name = models.CharField(max_length=255)
    storage_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_path)
    content_type = models.CharField(max_length=255, blank=True, default="")
    size = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.original_name} ({self.user_id})"

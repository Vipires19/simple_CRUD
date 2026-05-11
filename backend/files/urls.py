from django.urls import path

from .views import (
    UserFileDeleteView,
    UserFileDownloadView,
    UserFileListCreateView,
    UserFilePreviewView,
)

urlpatterns = [
    path("files/<int:pk>/download/", UserFileDownloadView.as_view(), name="files-download"),
    path("files/<int:pk>/preview/", UserFilePreviewView.as_view(), name="files-preview"),
    path("files/<int:pk>/", UserFileDeleteView.as_view(), name="files-delete"),
    path("files/", UserFileListCreateView.as_view(), name="files-list-create"),
]

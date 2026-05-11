import mimetypes

from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserFile
from .serializers import UserFileCreateSerializer, UserFileSerializer


class UserFileListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        qs = UserFile.objects.filter(user=request.user)
        return Response(UserFileSerializer(qs, many=True).data)

    def post(self, request):
        ser = UserFileCreateSerializer(data=request.data, context={"request": request})
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = ser.save()
        return Response(UserFileSerializer(obj).data, status=status.HTTP_201_CREATED)


class UserFileDownloadView(APIView):
    def get(self, request, pk):
        uf = get_object_or_404(UserFile, pk=pk, user=request.user)
        if not uf.file or not uf.file.name:
            raise Http404()
        fh = uf.file.open("rb")
        return FileResponse(
            fh,
            as_attachment=True,
            filename=uf.original_name,
            content_type=uf.content_type or mimetypes.guess_type(uf.original_name)[0],
        )


class UserFilePreviewView(APIView):
    def get(self, request, pk):
        uf = get_object_or_404(UserFile, pk=pk, user=request.user)
        ct = (uf.content_type or "").lower()
        if not ct.startswith("image/"):
            return Response(
                {"detail": "preview disponível apenas para imagens"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not uf.file or not uf.file.name:
            raise Http404()
        fh = uf.file.open("rb")
        return FileResponse(
            fh,
            as_attachment=False,
            filename=uf.original_name,
            content_type=uf.content_type,
        )


class UserFileDeleteView(APIView):
    def delete(self, request, pk):
        uf = get_object_or_404(UserFile, pk=pk, user=request.user)
        uf.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

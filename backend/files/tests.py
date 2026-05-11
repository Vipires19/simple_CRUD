import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.mark.django_db
def test_upload_list_delete(auth_client):
    r = auth_client.get("/api/csrf/")
    assert r.status_code == 200
    token = r.json()["csrfToken"]
    auth_client.credentials(HTTP_X_CSRFTOKEN=token)

    png = SimpleUploadedFile("x.png", b"\x89PNG\r\n\x1a\n", content_type="image/png")
    up = auth_client.post("/api/files/", {"file": png}, format="multipart")
    assert up.status_code == 201
    fid = up.json()["id"]

    lst = auth_client.get("/api/files/")
    assert lst.status_code == 200
    assert len(lst.json()) == 1

    dl = auth_client.get(f"/api/files/{fid}/download/")
    assert dl.status_code == 200

    pv = auth_client.get(f"/api/files/{fid}/preview/")
    assert pv.status_code == 200

    de = auth_client.delete(f"/api/files/{fid}/")
    assert de.status_code == 204

    lst2 = auth_client.get("/api/files/")
    assert lst2.json() == []


@pytest.mark.django_db
def test_reject_bad_extension(auth_client):
    r = auth_client.get("/api/csrf/")
    auth_client.credentials(HTTP_X_CSRFTOKEN=r.json()["csrfToken"])
    bad = SimpleUploadedFile("x.exe", b"abc", content_type="application/octet-stream")
    up = auth_client.post("/api/files/", {"file": bad}, format="multipart")
    assert up.status_code == 400

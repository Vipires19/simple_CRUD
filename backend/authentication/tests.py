import pytest


@pytest.mark.django_db
def test_register_login_me(api_client):
    r = api_client.get("/api/csrf/")
    assert r.status_code == 200
    token = r.json()["csrfToken"]
    api_client.credentials(HTTP_X_CSRFTOKEN=token)

    reg = api_client.post(
        "/api/auth/register/",
        {"email": "a@b.com", "password": "x" * 12},
        format="json",
    )
    assert reg.status_code == 201

    login = api_client.post(
        "/api/auth/login/",
        {"email": "a@b.com", "password": "x" * 12},
        format="json",
    )
    assert login.status_code == 200

    me = api_client.get("/api/auth/me/")
    assert me.status_code == 200
    assert me.json()["email"] == "a@b.com"

    out = api_client.post("/api/auth/logout/", {}, format="json")
    assert out.status_code == 200

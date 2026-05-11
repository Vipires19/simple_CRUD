import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="u@test.com", email="u@test.com", password="secret123"
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_login(user)
    return api_client

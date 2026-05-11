from django.urls import path

from .views import CsrfView, HealthView, LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("csrf/", CsrfView.as_view(), name="csrf"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
]

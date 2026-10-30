import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from .models import User
from .serializers import RegisterSerializer

CSRF_URL = reverse("auth-csrf")
REGISTER_URL = reverse("auth-register")
LOGIN_URL = reverse("auth-login")
LOGOUT_URL = reverse("auth-logout")
ME_URL = reverse("auth-me")
PASSWORD_CHANGE_URL = reverse("auth-password-change")

PASSWORD = "Str0ng-pass-123"
NEW_PASSWORD = "N3w-strong-pass-456"


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="maja", email="maja@example.com", password=PASSWORD, display_name="Maja"
    )


def test_csrf_endpoint_sets_cookie(api_client):
    response = api_client.get(CSRF_URL)

    assert response.status_code == 204
    assert "csrftoken" in response.cookies


@pytest.mark.django_db
def test_register_creates_user_and_logs_in(api_client):
    response = api_client.post(
        REGISTER_URL,
        {
            "email": "  Maja@Example.com",
            "username": "maja",
            "password": PASSWORD,
            "display_name": "Maja",
        },
    )

    assert response.status_code == 201
    assert response.data["email"] == "maja@example.com"
    assert response.data["username"] == "maja"
    assert response.data["display_name"] == "Maja"
    assert "password" not in response.data
    assert User.objects.get(email="maja@example.com").check_password(PASSWORD)
    assert api_client.get(ME_URL).status_code == 200


@pytest.mark.django_db
def test_register_without_display_name(api_client):
    response = api_client.post(
        REGISTER_URL, {"email": "maja@example.com", "username": "maja", "password": PASSWORD}
    )

    assert response.status_code == 201
    assert response.data["display_name"] == ""


@pytest.mark.parametrize("email", ["maja@example.com", "MAJA@example.com"])
def test_register_rejects_existing_email_in_any_lettercase(api_client, user, email):
    response = api_client.post(
        REGISTER_URL, {"email": email, "username": "maja2", "password": PASSWORD}
    )

    assert response.status_code == 400
    assert response.data["email"] == ["A user with this email already exists."]
    assert User.objects.count() == 1


@pytest.mark.parametrize("username", ["maja", "MAJA"])
def test_register_rejects_existing_username_in_any_lettercase(api_client, user, username):
    response = api_client.post(
        REGISTER_URL, {"email": "other@example.com", "username": username, "password": PASSWORD}
    )

    assert response.status_code == 400
    assert response.data["username"] == ["A user with this username already exists."]
    assert User.objects.count() == 1


@pytest.mark.django_db
def test_register_returns_validation_error_when_user_is_created_concurrently():
    serializer = RegisterSerializer(
        data={"email": "maja@example.com", "username": "maja", "password": PASSWORD}
    )
    assert serializer.is_valid()
    User.objects.create_user(username="MAJA", email="other@example.com", password=PASSWORD)

    with pytest.raises(ValidationError):
        serializer.save()

    assert User.objects.count() == 1


@pytest.mark.django_db
@pytest.mark.parametrize("password", ["short", "12345678901", "password123"])
def test_register_rejects_weak_password(api_client, password):
    response = api_client.post(
        REGISTER_URL, {"email": "maja@example.com", "username": "maja", "password": password}
    )

    assert response.status_code == 400
    assert "password" in response.data
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_register_rejects_password_similar_to_email(api_client):
    response = api_client.post(
        REGISTER_URL,
        {"email": "majeczka@example.com", "username": "majeczka", "password": "majeczka"},
    )

    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "payload",
    [
        {"username": "maja", "password": PASSWORD},
        {"email": "maja@example.com", "password": PASSWORD},
        {"email": "maja@example.com", "username": "maja"},
        {"email": "not-an-email", "username": "maja", "password": PASSWORD},
        {"email": "maja@example.com", "username": "maja ja", "password": PASSWORD},
    ],
)
def test_register_rejects_invalid_payload(api_client, payload):
    response = api_client.post(REGISTER_URL, payload)

    assert response.status_code == 400
    assert User.objects.count() == 0


def test_login_with_valid_credentials(api_client, user):
    response = api_client.post(LOGIN_URL, {"email": "MAJA@example.com", "password": PASSWORD})

    assert response.status_code == 200
    assert response.data["email"] == "maja@example.com"
    assert api_client.get(ME_URL).data["id"] == user.id


@pytest.mark.parametrize(
    "credentials",
    [
        {"email": "maja@example.com", "password": "wrong-password"},
        {"email": "nobody@example.com", "password": PASSWORD},
    ],
)
def test_login_with_invalid_credentials(api_client, user, credentials):
    response = api_client.post(LOGIN_URL, credentials)

    assert response.status_code == 400
    assert response.data["non_field_errors"] == ["Invalid email or password."]
    assert api_client.get(ME_URL).status_code == 403


def test_login_rejects_inactive_user(api_client, user):
    user.is_active = False
    user.save()

    response = api_client.post(LOGIN_URL, {"email": "maja@example.com", "password": PASSWORD})

    assert response.status_code == 400


def test_logout_ends_session(api_client, user):
    api_client.force_login(user)

    response = api_client.post(LOGOUT_URL)

    assert response.status_code == 204
    assert api_client.get(ME_URL).status_code == 403


@pytest.mark.django_db
def test_logout_when_not_logged_in(api_client):
    assert api_client.post(LOGOUT_URL).status_code == 204


@pytest.mark.django_db
def test_me_requires_login(api_client):
    assert api_client.get(ME_URL).status_code == 403


def test_me_returns_current_user(api_client, user):
    api_client.force_login(user)

    response = api_client.get(ME_URL)

    assert response.data == {
        "id": user.id,
        "email": "maja@example.com",
        "username": "maja",
        "display_name": "Maja",
        "color": "#6366f1",
    }


@pytest.mark.django_db
@pytest.mark.parametrize("url", [REGISTER_URL, LOGIN_URL])
def test_auth_endpoints_require_csrf_token(url):
    client = APIClient(enforce_csrf_checks=True)

    response = client.post(url, {"email": "maja@example.com", "password": PASSWORD})

    assert response.status_code == 403
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_auth_flow_with_csrf_token_rotated_after_login():
    client = APIClient(enforce_csrf_checks=True)
    client.get(CSRF_URL)

    def post(url, data=None):
        return client.post(url, data, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)

    register = post(
        REGISTER_URL, {"email": "maja@example.com", "username": "maja", "password": PASSWORD}
    )
    logout = post(LOGOUT_URL)
    login = post(LOGIN_URL, {"email": "maja@example.com", "password": PASSWORD})

    assert register.status_code == 201
    assert logout.status_code == 204
    assert login.status_code == 200


def register_from(origin):
    client = APIClient(enforce_csrf_checks=True)
    client.get(CSRF_URL)
    return client.post(
        REGISTER_URL,
        {"email": "maja@example.com", "username": "maja", "password": PASSWORD},
        HTTP_ORIGIN=origin,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


@pytest.mark.django_db
def test_register_accepts_trusted_frontend_origin(settings):
    assert register_from(settings.CSRF_TRUSTED_ORIGINS[0]).status_code == 201


@pytest.mark.django_db
def test_register_rejects_untrusted_origin():
    assert register_from("https://evil.example.com").status_code == 403


def test_login_is_throttled(api_client, user):
    for _ in range(10):
        api_client.post(LOGIN_URL, {"email": "maja@example.com", "password": "wrong-password"})

    response = api_client.post(LOGIN_URL, {"email": "maja@example.com", "password": PASSWORD})

    assert response.status_code == 429


@pytest.fixture
def logged_in_client(api_client, user):
    api_client.force_login(user)
    return api_client


def change_password(client, current=PASSWORD, new=NEW_PASSWORD):
    return client.post(PASSWORD_CHANGE_URL, {"current_password": current, "new_password": new})


def test_change_password(logged_in_client, user):
    response = change_password(logged_in_client)

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password(NEW_PASSWORD)
    assert logged_in_client.get(ME_URL).status_code == 200


def test_change_password_logs_out_other_sessions(logged_in_client, user):
    other_device = APIClient()
    other_device.force_login(user)

    change_password(logged_in_client)

    assert other_device.get(ME_URL).status_code == 403


def test_change_password_rejects_wrong_current_password(logged_in_client, user):
    response = change_password(logged_in_client, current="wrong-password")

    assert response.status_code == 400
    assert "current_password" in response.data
    user.refresh_from_db()
    assert user.check_password(PASSWORD)


@pytest.mark.parametrize("new", ["short", "12345678901", "password123", PASSWORD])
def test_change_password_rejects_weak_or_same_password(logged_in_client, new):
    response = change_password(logged_in_client, new=new)

    assert response.status_code == 400
    assert "new_password" in response.data


@pytest.mark.django_db
def test_change_password_requires_login(api_client):
    assert change_password(api_client).status_code == 403


def test_change_password_requires_csrf_token(user):
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)

    assert change_password(client).status_code == 403

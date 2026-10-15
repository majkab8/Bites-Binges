import pytest
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.urls.base import reverse

from .models import User, hex_color_validator

ADD_USER_URL = reverse("admin:accounts_user_add")


@pytest.fixture
def logged_in_admin(client, db):
    admin = User.objects.create_superuser(
        username="admin", email="admin@example.com", password="secret123"
    )
    client.force_login(admin)
    return client


def add_user_form(username, email):
    return {
        "username": username,
        "email": email,
        "password1": "Str0ng-pass-123",
        "password2": "Str0ng-pass-123",
        "usable_password": "true",
        "display_name": "",
        "color": "#6366f1",
    }


@pytest.mark.parametrize(
    "value",
    ["#6366f1", "#FFFFFF", "#000000", "#AbCdEf"],
)
def test_valid_hex_colors_pass(value):
    hex_color_validator(value)


@pytest.mark.parametrize(
    "value",
    [
        "red",  # color name
        "6366f1",  # missing #
        "#12345",  # too short
        "#1234567",  # too long
        "#ggg000",  # not hex characters
        "",  # empty
        " #6366f1",  # leading space
        "#6366f1\n",  # trailing newline
    ],
)
def test_invalid_hex_colors_fail(value):
    with pytest.raises(ValidationError) as error:
        hex_color_validator(value)

    assert error.value.code == "invalid_color"


def test_new_user_default_color():
    user = User(email="majeczkab8@example.com", username="majeczkab8")

    assert user.color == "#6366f1"


def test_password_is_saved_as_hash():
    user = User(email="majeczkab8@example.com", username="majeczkab8")
    user.set_password("secret123")

    assert user.password != "secret123"
    assert user.password.startswith("argon2")


@pytest.mark.django_db
def test_create_user_hashes_password():
    user = User.objects.create_user(
        username="majeczkab8", email="majeczkab8@example.com", password="secret123"
    )

    user.refresh_from_db()
    assert user.password != "secret123"
    assert user.password.startswith("argon2")
    assert user.check_password("secret123")
    assert not user.check_password("wrong-password")


@pytest.mark.django_db
def test_create_user_email_is_saved_lowercased():
    user = User.objects.create_user(
        username="majeczkab8", email="   MaJeCzKab8@example.com", password="secret123"
    )

    user.refresh_from_db()
    assert user.email == "majeczkab8@example.com"


@pytest.mark.django_db
def test_create_user_doesnt_allow_same_email_with_different_lettercase():
    User.objects.create_user(
        username="majeczkab8", email="   MaJeCzKab8@example.com", password="secret123"
    )

    with pytest.raises(IntegrityError):
        User.objects.create_user(
            username="majeczkab9", email="   mAjEcZkAb8@example.com", password="secret123"
        )


@pytest.mark.django_db
def test_login_works_with_email_uppercased():
    User.objects.create_user(
        username="majeczkab8", email="majeczkab8@example.com", password="secret123"
    )

    user = authenticate(username="MaJeCzKab8@example.com", password="secret123")

    assert user is not None
    assert user.email == "majeczkab8@example.com"


@pytest.mark.django_db
def test_create_user_without_email_raises_error():
    with pytest.raises(ValueError, match="email"):
        User.objects.create_user(username="majeczkab8", password="secret123")

    assert User.objects.count() == 0


def test_admin_can_add_two_users_with_different_emails(logged_in_admin):
    first = logged_in_admin.post(ADD_USER_URL, add_user_form("maja", "maja@example.com"))
    second = logged_in_admin.post(ADD_USER_URL, add_user_form("darek", "darek@example.com"))

    assert first.status_code == 302
    assert second.status_code == 302
    assert User.objects.count() == 3


def test_admin_add_user_without_email_shows_form_error(logged_in_admin):
    response = logged_in_admin.post(ADD_USER_URL, add_user_form("maja", ""))

    assert response.status_code == 200
    assert "email" in response.context["adminform"].form.errors
    assert User.objects.count() == 1

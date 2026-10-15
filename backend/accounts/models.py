from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions.text import Lower

hex_color_validator = RegexValidator(
    regex=r"\A#[0-9A-Fa-f]{6}\Z",
    message="Color must be a hex value",
    code="invalid_color",
)


class UserManager(DjangoUserManager):
    def get_by_natural_key(self, username):
        return self.get(**{f"{self.model.USERNAME_FIELD}__iexact": username.strip()})

    def _create_user(self, username, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        return super()._create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField("email", unique=True)
    display_name = models.CharField("display name", max_length=50, blank=True)
    color = models.CharField(
        "color",
        max_length=7,
        default="#6366f1",
        validators=[hex_color_validator],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    objects = UserManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="unique_email_case_insensitive"),
        ]

    def __str__(self):
        return self.display_name or self.email

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

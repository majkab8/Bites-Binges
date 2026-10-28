from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions.text import Lower
from django.utils import timezone

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
    failed_login_attempts = models.PositiveSmallIntegerField("failed login attempts", default=0)
    lockout_until = models.DateTimeField("lockout until", null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    objects = UserManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="unique_email_case_insensitive"),
            models.UniqueConstraint(Lower("username"), name="unique_username_case_insensitive"),
        ]

    def __str__(self):
        return self.display_name or self.email

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def is_locked(self):
        return self.lockout_until is not None and self.lockout_until > timezone.now()

    def register_failed_login(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= settings.LOGIN_LOCKOUT["MAX_FAILED_ATTEMPTS"]:
            self.lockout_until = timezone.now() + settings.LOGIN_LOCKOUT["LOCKOUT_DURATION"]
            self.failed_login_attempts = 0
        self.save(update_fields=["failed_login_attempts", "lockout_until"])

    def reset_failed_login_attempts(self):
        if self.failed_login_attempts == 0 and self.lockout_until is None:
            return
        self.failed_login_attempts = 0
        self.lockout_until = None
        self.save(update_fields=["failed_login_attempts", "lockout_until"])

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField("e-mail", unique=True)
    display_name = models.CharField("display name", max_length=50, blank=True)
    color = models.CharField("color", max_length=7, default="#6366f1")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.display_name or self.email

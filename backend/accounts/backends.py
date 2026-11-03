from django.contrib.auth.backends import ModelBackend
from django.core.exceptions import PermissionDenied

from .models import User


class LockoutModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None
        try:
            user = User._default_manager.get_by_natural_key(username)
        except User.DoesNotExist:
            User().set_password(password)
            return None
        if user.is_locked():
            raise PermissionDenied
        if not user.check_password(password):
            user.register_failed_login()
            return None
        if not self.user_can_authenticate(user):
            return None
        user.reset_failed_login_attempts()
        return user

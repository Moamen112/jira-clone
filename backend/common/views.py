from django.http import Http404
from rest_framework.exceptions import NotFound


class FriendlyNotFoundMixin:
    not_found_message = None

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise NotFound(self.not_found_message) from None

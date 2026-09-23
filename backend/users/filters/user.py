import django_filters as filters

from users.models import User


class UserFilter(filters.FilterSet):
    email = filters.CharFilter(field_name="email", lookup_expr="iexact")
    project = filters.NumberFilter(field_name="memberships__project_id")

    class Meta:
        model = User
        fields = ["email", "project"]

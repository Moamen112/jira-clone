import django_filters as filters

from tasks.models import TaskType


class TaskTypeFilter(filters.FilterSet):
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = TaskType
        fields = ["name", "is_active"]

import django_filters as filters
from django.db.models import Q

from tasks.models import Task, TaskStatus


class TaskFilter(filters.FilterSet):
    project = filters.NumberFilter(field_name="project_id")
    project_key = filters.CharFilter(field_name="project__key", lookup_expr="iexact")
    status = filters.MultipleChoiceFilter(choices=TaskStatus.choices)
    type = filters.NumberFilter(field_name="type_id")
    assignee = filters.NumberFilter(field_name="assignee_id")
    reporter = filters.NumberFilter(field_name="reporter_id")
    unassigned = filters.BooleanFilter(field_name="assignee_id", lookup_expr="isnull")
    mine = filters.BooleanFilter(method="filter_mine", label="Reported by or assigned to me")

    created_after = filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    due_after = filters.DateFilter(field_name="due_date", lookup_expr="gte")
    due_before = filters.DateFilter(field_name="due_date", lookup_expr="lte")

    class Meta:
        model = Task
        fields = [
            "project",
            "project_key",
            "status",
            "type",
            "assignee",
            "reporter",
            "unassigned",
            "mine",
            "created_after",
            "created_before",
            "due_after",
            "due_before",
        ]

    def filter_mine(self, queryset, name, value):
        if not value:
            return queryset
        user = self.request.user
        return queryset.filter(Q(reporter=user) | Q(assignee=user))

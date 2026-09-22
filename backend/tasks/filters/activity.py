import django_filters as filters

from tasks.models import TaskActivity, TaskActivityAction


class TaskActivityFilter(filters.FilterSet):
    tab = filters.ChoiceFilter(
        choices=[("all", "All"), ("comments", "Comments"), ("history", "History")],
        method="filter_tab",
        label="Activity tab",
    )

    class Meta:
        model = TaskActivity
        fields = ["tab"]

    def filter_tab(self, queryset, name, value):
        if value == "comments":
            return queryset.filter(action=TaskActivityAction.COMMENTED)
        if value == "history":
            return queryset.exclude(action=TaskActivityAction.COMMENTED)
        return queryset

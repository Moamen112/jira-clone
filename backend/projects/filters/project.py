import django_filters as filters

from projects.models import Project, ProjectStatus


class ProjectFilter(filters.FilterSet):
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")
    status = filters.MultipleChoiceFilter(choices=ProjectStatus.choices)
    owner = filters.NumberFilter(field_name="owner_id")

    class Meta:
        model = Project
        fields = ["name", "status", "owner"]

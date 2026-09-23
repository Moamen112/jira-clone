from django.contrib import admin

from projects.models import Project, ProjectMembership


class MembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0
    autocomplete_fields = ["user"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["key", "name", "status", "owner", "task_counter", "created_at"]
    list_filter = ["status"]
    search_fields = ["key", "name"]
    autocomplete_fields = ["owner"]
    inlines = [MembershipInline]
    list_select_related = ["owner"]


@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ["project", "user", "role", "joined_at"]
    list_filter = ["role"]
    search_fields = ["project__key", "user__email"]
    list_select_related = ["project", "user"]

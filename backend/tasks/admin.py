from django.contrib import admin

from tasks.models import Comment, Task, TaskActivity, TaskType


@admin.register(TaskType)
class TaskTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "project__key"]
    list_select_related = ["project"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["key", "title", "project", "type", "status", "reporter", "assignee", "due_date"]
    list_filter = ["status", "project"]
    search_fields = ["key", "title", "description"]
    autocomplete_fields = ["reporter", "assignee"]
    list_select_related = ["project", "type", "reporter", "assignee"]
    readonly_fields = ["key", "created_at", "updated_at"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["task", "author", "created_at", "edited_at"]
    search_fields = ["body", "task__key", "author__email"]
    list_select_related = ["task", "author"]
    readonly_fields = ["created_at", "updated_at", "edited_at"]


@admin.register(TaskActivity)
class TaskActivityAdmin(admin.ModelAdmin):
    list_display = ["task", "actor", "action", "field", "old_value", "new_value", "created_at"]
    list_filter = ["action", "field"]
    search_fields = ["task__key", "actor__email"]
    list_select_related = ["task", "actor"]

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

from projects.views import MembershipViewSet, ProjectViewSet
from tasks.views import CommentViewSet, TaskActivityViewSet, TaskTypeViewSet, TaskViewSet
from users.views import (
    LoginViewSet,
    LogoutViewSet,
    RefreshViewSet,
    RegisterViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register("auth/register", RegisterViewSet, basename="register")
router.register("auth/login", LoginViewSet, basename="login")
router.register("auth/refresh", RefreshViewSet, basename="refresh")
router.register("auth/logout", LogoutViewSet, basename="logout")
router.register("users", UserViewSet, basename="user")
router.register("projects", ProjectViewSet, basename="project")
router.register("tasks", TaskViewSet, basename="task")

projects_router = NestedSimpleRouter(router, "projects", lookup="project")
projects_router.register("members", MembershipViewSet, basename="project-members")
projects_router.register("task-types", TaskTypeViewSet, basename="project-task-types")

tasks_router = NestedSimpleRouter(router, "tasks", lookup="task")
tasks_router.register("comments", CommentViewSet, basename="task-comments")
tasks_router.register("activity", TaskActivityViewSet, basename="task-activity")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/", include(projects_router.urls)),
    path("api/", include(tasks_router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]

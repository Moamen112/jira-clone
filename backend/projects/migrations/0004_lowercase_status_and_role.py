"""Lowercase the stored values of ProjectStatus and MembershipRole.

Hand-written rather than generated: the data has to move between the constraint being
dropped and re-added, which ``makemigrations`` cannot infer.
"""

from django.db import migrations, models

PROJECT_STATUS = {"ACTIVE": "active", "DONE": "done", "ARCHIVED": "archived"}
MEMBERSHIP_ROLE = {"OWNER": "owner", "MEMBER": "member"}


def _remap(apps, label, field, mapping):
    model = apps.get_model("projects", label)
    for old, new in mapping.items():
        model.objects.filter(**{field: old}).update(**{field: new})


def forwards(apps, schema_editor):
    _remap(apps, "Project", "status", PROJECT_STATUS)
    _remap(apps, "ProjectMembership", "role", MEMBERSHIP_ROLE)


def backwards(apps, schema_editor):
    _remap(apps, "Project", "status", {v: k for k, v in PROJECT_STATUS.items()})
    _remap(apps, "ProjectMembership", "role", {v: k for k, v in MEMBERSHIP_ROLE.items()})


class Migration(migrations.Migration):
    dependencies = [("projects", "0003_alter_project_key")]

    operations = [
        # Dropped first: its condition matches the old uppercase value, so it would stop
        # enforcing the moment the data moves.
        migrations.RemoveConstraint(
            model_name="projectmembership",
            name="uniq_single_owner_per_project",
        ),
        migrations.AlterField(
            model_name="project",
            name="status",
            field=models.CharField(
                choices=[("active", "Active"), ("done", "Done"), ("archived", "Archived")],
                default="active",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="projectmembership",
            name="role",
            field=models.CharField(
                choices=[("owner", "Owner"), ("member", "Member")],
                default="member",
                max_length=10,
            ),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.AddConstraint(
            model_name="projectmembership",
            constraint=models.UniqueConstraint(
                condition=models.Q(("role", "owner")),
                fields=("project",),
                name="uniq_single_owner_per_project",
            ),
        ),
    ]

from django.db import transaction
from django.utils import timezone

from tasks.models import Comment

from .activity import record_comment, record_comment_deleted


@transaction.atomic
def create_comment(*, task, author, body: str) -> Comment:
    comment = Comment.objects.create(task=task, author=author, body=body)
    record_comment(comment)
    return comment


@transaction.atomic
def edit_comment(comment: Comment, body: str) -> Comment:
    comment.body = body
    comment.edited_at = timezone.now()
    comment.save(update_fields=["body", "edited_at", "updated_at"])
    return comment


@transaction.atomic
def delete_comment(comment: Comment, actor) -> None:
    record_comment_deleted(comment, actor)
    comment.delete()

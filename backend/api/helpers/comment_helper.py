from api import db, bcrypt
from api.models.cf_models import Comments, Users, Campaigns
from datetime import datetime
from sqlalchemy.exc import IntegrityError


def create_comment(user_id, campaign_id, content):
    """Create a comment for a campaign and return it as a dict.
    Commits the new comment to the database.
    """
    comment = Comments(user_id=user_id, campaign_id=campaign_id, content=content)
    db.session.add(comment)
    try:
        db.session.commit()
        return comment.to_dict()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not create comment: {str(e)}")


def delete_comment(comment_id):
    """Delete a comment by its id and return a confirmation message.
    Raises ValueError if comment does not exist.
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        raise ValueError(f"Could not find comment with comment id: {comment_id}")

    try:
        db.session.delete(comment)
        db.session.commit()
        return {"message": f"Comment {comment_id} deleted successfully"}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not delete comment {comment_id}: {str(e)}")


def update_comment(comment_id, updated_content):
    """Update the content of a comment and return the updated dict.
    Raises ValueError if comment does not exist.
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        raise ValueError(f"Could not find comment with comment id: {comment_id}")

    comment.content = updated_content
    try:
        db.session.commit()
        return comment.to_dict()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update comment: {str(e)}")


def view_comment_by_comment_id(comment_id):
    """Return a single comment by its id as a dict.
    Raises ValueError if not found.
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        raise ValueError(f"Could not find comment with comment id: {comment_id}")
    return comment.to_dict()


def view_all_comments_by_user(user_id):
    """List all comments created by a specific user.
    Returns a list of comment dicts.
    """
    comments = Comments.query.filter_by(user_id=user_id).all()
    return [comment.to_dict() for comment in comments]


def view_all_comments_by_campaign(campaign_id):
    """List all comments for a campaign.
    Returns a list of comment dicts.
    """
    comments = Comments.query.filter_by(campaign_id=campaign_id).all()
    return [comment.to_dict() for comment in comments]


def toggle_like(comment_id, user_id):
    """Toggle like/unlike for a comment by a user and return updated comment.
    Returns action message and the updated comment dict.
    """
    user = Users.query.get(user_id)
    comment = Comments.query.get(comment_id)

    if not user:
        raise ValueError(f"User with user id: {user_id} not found")

    if not comment:
        raise ValueError(f"Comment with comment id: {comment_id} not found")

    try:
        if comment in user.liked_comments:
            user.liked_comments.remove(comment)
            comment.likes = comment.likes - 1 if comment.likes > 0 else 0
            action = "unliked"
        else:
            user.liked_comments.append(comment)
            comment.likes = comment.likes + 1
            action = "liked"

        db.session.commit()
        return {
            "message": f"Comment {action} successfully",
            "comment": comment.to_dict(),
        }

    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not toggle like for comment {comment_id}: {str(e)}")


def get_total_likes(comment_id):
    """Return total likes for a comment by id.
    Raises ValueError if the comment doesn't exist.
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        raise ValueError(f"Comment with id {comment_id} not found")
    return comment.likes

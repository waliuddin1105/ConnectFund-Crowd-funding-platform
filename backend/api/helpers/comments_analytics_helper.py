from sqlalchemy import func
from api import db
from api.models import Comments, Users, Campaigns


def get_total_comments():
    """Return the total number of comments across all campaigns.
    Returns an integer count.
    """
    return db.session.query(func.count(Comments.comment_id)).scalar()


def get_total_comments_by_user(user_id):
    """Return the total number of comments created by a specific user.
    Useful for analytics and leaderboards.
    """
    return (
        db.session.query(func.count(Comments.comment_id))
        .filter_by(user_id=user_id)
        .scalar()
    )


def get_total_comments_by_campaign(campaign_id):
    """Return the total number of comments for a campaign.
    Returns an integer count.
    """
    return (
        db.session.query(func.count(Comments.comment_id))
        .filter_by(campaign_id=campaign_id)
        .scalar()
    )


def get_top_commenters(limit=5):
    """Return top commenters as list of {username, comment_count}.
    Defaults to the top 5 commenters.
    """
    results = (
        db.session.query(
            Users.username, func.count(Comments.comment_id).label("comment_count")
        )
        .join(Comments, Users.user_id == Comments.user_id)
        .group_by(Users.username)
        .order_by(func.count(Comments.comment_id).desc())
        .limit(limit)
        .all()
    )

    return [{"username": r.username, "comment_count": r.comment_count} for r in results]


def get_top_commented_campaigns(limit=5):
    """Return campaigns with most comments as list of {title, comment_count}.
    Defaults to the top 5 campaigns.
    """
    results = (
        db.session.query(
            Campaigns.title, func.count(Comments.comment_id).label("comment_count")
        )
        .join(Comments, Campaigns.campaign_id == Comments.campaign_id)
        .group_by(Campaigns.title)
        .order_by(func.count(Comments.comment_id).desc())
        .limit(limit)
        .all()
    )

    return [{"title": r.title, "comment_count": r.comment_count} for r in results]


def get_average_likes_per_comment():
    """Compute average likes per comment across all comments.
    Returns a rounded float.
    """
    avg_likes = db.session.query(func.avg(Comments.likes)).scalar()
    return round(avg_likes or 0, 2)

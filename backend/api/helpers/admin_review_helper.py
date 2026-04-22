from api import db, bcrypt
from api.models.cf_models import AdminReviews
from datetime import datetime
from sqlalchemy.exc import IntegrityError


def create_admin_review(admin_id, campaign_id, decision, comments):
    """Create an admin review for a campaign.
    Returns the created review as a dictionary.
    """
    if not decision:
        raise ValueError("Decision field cannot be empty")

    admin_review = AdminReviews(
        admin_id=admin_id, campaign_id=campaign_id, decision=decision, comments=comments
    )
    try:
        db.session.add(admin_review)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(
            f"Failed to add admin review for campaign {campaign_id}: {str(e)}"
        )

    return admin_review.to_dict()


def view_admin_review_by_review_id(review_id):
    """Fetch a single admin review by its review_id.
    Raises ValueError if not found.
    """
    admin_review = AdminReviews.query.get(review_id)
    if not admin_review:
        raise ValueError(f"No admin review with review id: {review_id} was found")
    return admin_review.to_dict()


def view_all_admin_reviews_by_admin_id(admin_id):
    """Return all admin reviews created by the given admin_id.
    Returns a list of review dictionaries.
    """
    admin_reviews = AdminReviews.query.filter_by(admin_id=admin_id).all()
    return [admin_review.to_dict() for admin_review in admin_reviews]


def view_all_admin_reviews_by_campaign_id(campaign_id):
    """Return all admin reviews associated with a campaign.
    Returns a list of review dictionaries.
    """
    admin_reviews = AdminReviews.query.filter_by(campaign_id=campaign_id).all()
    return [admin_review.to_dict() for admin_review in admin_reviews]


def delete_admin_review(review_id):
    """Delete an admin review by its review_id.
    Returns a confirmation message on success.
    """
    admin_review = AdminReviews.query.get(review_id)
    if not admin_review:
        raise ValueError(f"No admin review with review id: {review_id} was found")

    try:
        db.session.delete(admin_review)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(
            f"Could not delete admin review with review id {review_id}: {str(e)}"
        )

    return {"message": f"Admin review {review_id} deleted successfully"}


def update_admin_review(review_id, **kwargs):
    """Update allowed fields (decision, comments) on an admin review.
    Returns the updated review as a dict.
    """
    admin_review = AdminReviews.query.get(review_id)

    if not admin_review:
        raise ValueError(f"No admin review with review id: {review_id} was found")

    allowed_fields = ["decision", "comments"]
    for field, value in kwargs.items():
        if field in allowed_fields:
            if field == "decision" and value is None:
                raise ValueError("Decision field cannot be empty")
            setattr(admin_review, field, value)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update admin review {review_id}: {str(e)}")

    return admin_review.to_dict()


def view_reviews_by_decision(decision):
    """List admin reviews filtered by decision value.
    Returns a list of matching review dicts.
    """
    reviews = AdminReviews.query.filter_by(decision=decision).all()
    return [review.to_dict() for review in reviews]

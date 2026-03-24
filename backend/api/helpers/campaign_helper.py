from api import db, bcrypt
from api.models.cf_models import (
    Users,
    CampaignCategory,
    Campaigns,  
    CampaignStatus,
    CampaignUpdates,
)
from datetime import datetime
from sqlalchemy.exc import IntegrityError


def create_campaign(
    creator_id, title, description, goal_amount, image, category, raised_amount, start_date, end_date, status='pending'
):
    """Create a new campaign and return it as a dict.
    Validates category and status enums.
    """
    try:
        start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        try:
            category_enum = CampaignCategory(category.strip().lower())
        except ValueError:
            raise ValueError(f"Invalid category '{category}'")

        try:
            status_enum = CampaignStatus(status.strip().lower())
        except ValueError:
            raise ValueError(f"Invalid status '{status}'")
        print('inside create campaign helper')
        float_goal_amount = float(goal_amount)
        campaign = Campaigns(
            creator_id=creator_id,
            title=title,
            description=description,
            image=image,
            category=category_enum,
            goal_amount=float_goal_amount,
            status=status_enum,
            raised_amount=raised_amount,
            start_date=start_date,
            end_date=end_date
        )
        print('campaign to add: ',campaign)
        db.session.add(campaign)
        db.session.commit()
        return campaign.to_dict()
    except ValueError as e:
        db.session.rollback()
        raise ValueError(f"Invalid status or category: {str(e)}")
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not create campaign: {str(e)}")


def delete_campaign(campaign_id):
    """Delete a campaign by id and return a success message.
    Raises ValueError if campaign not found.
    """
    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"No campaign found with campaign id: {campaign_id}")

    try:
        db.session.delete(campaign)
        db.session.commit()
        return {"message": f"Campaign {campaign_id} deleted successfully"}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not delete campaign {campaign_id}: {str(e)}")


def view_campaign_by_campaign_id(campaign_id):
    """Return a campaign as a dict given its campaign_id.
    Raises ValueError when campaign does not exist.
    """
    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"No campaign with campaign id: {campaign_id} was found")
    return campaign.to_dict()


def view_all_campaigns_by_creator(creator_id):
    """List all campaigns created by a specific user (creator_id).
    Returns a list of campaign dicts.
    """
    campaigns = Campaigns.query.filter_by(creator_id=creator_id).all()
    return [campaign.to_dict() for campaign in campaigns]


def update_campaign_status(campaign_id, new_status):
    """Update campaign status and create a CampaignUpdates entry recording the change.
    Returns the updated campaign as a dict.
    """
    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"No campaign found with campaign id: {campaign_id}")

    try:
        if not isinstance(new_status, CampaignStatus):
            new_status = CampaignStatus(new_status)
    except Exception as e:
        raise ValueError(f"Invalid status: {new_status}")

    old_status = campaign.status
    if old_status == new_status:
        return {"message": "No status change detected", "campaign": campaign.to_dict()}

    campaign.status = new_status

    changes = {"status": {"old": str(old_status), "new": str(new_status)}}
    campaign_update = CampaignUpdates(content=str(changes), campaign_id=campaign_id)

    try:
        db.session.add(campaign_update)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update campaign status: {str(e)}")

    return campaign.to_dict()


def approve_campaign(campaign_id):
    """Approve a campaign by setting its status to ACTIVE.
    Returns the updated campaign dict.
    """
    return update_campaign_status(campaign_id, CampaignStatus.ACTIVE)


def update_campaign(campaign_id, **kwargs):
    """
    Updates campaign fields.
    
    IMPORTANT: raised_amount is NOT in allowed_fields - it should ONLY be updated
    through the payment system to maintain data integrity.
    """
    """Update allowed campaign fields and record changes as a CampaignUpdate.
    Returns the updated campaign dict or a message when no changes made.
    """
    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"No campaign found with campaign id: {campaign_id}")

    # REMOVED raised_amount from allowed_fields to prevent manual manipulation
    allowed_fields = [
        "title",
        "description",
        "category",
        "goal_amount",
    ]
    changes = {}

    for field, value in kwargs.items():
        if field in allowed_fields:
            old_value = getattr(campaign, field)

            if field == "category":
                try:
                    new_value = (
                        value
                        if isinstance(value, CampaignCategory)
                        else CampaignCategory(value)
                    )
                except Exception as e:
                    raise ValueError(f"Invalid category: {str(e)}")
            else:
                new_value = value

            setattr(campaign, field, new_value)
            if old_value != new_value:
                changes[field] = {"old": str(old_value), "new": str(new_value)}
        elif field == "raised_amount":
            raise ValueError("Cannot manually update raised_amount. It is automatically updated through the payment system.")

    if not changes:
        return {"message": "No changes made", "campaign": campaign.to_dict()}

    campaign_update = CampaignUpdates(content=str(changes), campaign_id=campaign_id)

    try:
        db.session.add(campaign_update)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update campaign: {str(e)}")

    return campaign.to_dict()


def search_campaign_by_title(title):
    """Search campaigns by title substring and return matching dicts.
    Case-insensitive.
    """
    campaigns = Campaigns.query.filter(Campaigns.title.ilike(f"%{title}%")).all()
    return [campaign.to_dict() for campaign in campaigns]


def view_campaigns_by_category(category):
    """Return campaigns filtered by category enum (accepts string or enum).
    Raises ValueError for invalid categories.
    """
    try:
        if not isinstance(category, CampaignCategory):
            category = CampaignCategory(category)
    except Exception as e:
        raise ValueError(f"Invalid category: {category}")

    campaigns = Campaigns.query.filter_by(category=category).all()
    return [campaign.to_dict() for campaign in campaigns]


def view_all_active_campaigns():
    """List all campaigns with ACTIVE status.
    Returns list of campaign dicts.
    """
    campaigns = Campaigns.query.filter_by(status=CampaignStatus.active).all()
    return [campaign.to_dict() for campaign in campaigns]


def view_all_campaigns():
    """Return all campaigns as a list of dicts.
    Useful for admin or listing pages.
    """
    return [campaign.to_dict() for campaign in Campaigns.query.all()]


def view_all_completed_campaigns():
    """List campaigns that have reached COMPLETED status.
    Returns a list of campaign dicts.
    """
    campaigns = Campaigns.query.filter_by(status=CampaignStatus.completed).all()
    return [campaign.to_dict() for campaign in campaigns]


def view_all_campaigns_paginated(page=1, per_page=10, category=None, status=None):
    """Paginate campaigns optionally filtering by category or status.
    Returns a list of campaign dicts for the page requested.
    """
    query = Campaigns.query
    if category:
        try:
            query = query.filter_by(category=CampaignCategory(category))
        except Exception as e:
            raise ValueError(f"Invalid category: {category}")
    if status:
        try:
            query = query.filter_by(status=CampaignStatus(status))
        except Exception as e:
            raise ValueError(f"Invalid status: {status}")
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return [c.to_dict() for c in pagination.items]


def get_campaign_available_amount(campaign_id):
    """Return the remaining amount that can be donated to a campaign.
    Considers pending and completed donations when computing availability.
    """
    from api.models.cf_models import Donations, DonationStatus

    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"No campaign found with campaign id: {campaign_id}")

    # Get sum of all pending and completed donations
    pending_total = db.session.query(db.func.sum(Donations.amount)).filter(
        Donations.campaign_id == campaign_id,
        Donations.status.in_([DonationStatus.pending, DonationStatus.completed])
    ).scalar() or 0

    available = campaign.goal_amount - float(pending_total)
    return max(0, available)  # Never return negative

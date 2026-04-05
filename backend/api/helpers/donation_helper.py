from api import db, bcrypt
from api.models.cf_models import Donations,DonationStatus
from datetime import datetime
from sqlalchemy.exc import IntegrityError


def create_donation(user_id, campaign_id, amount, status="pending"):
    """Create a donation for a campaign after validating amount and campaign status.
    Returns the created donation as a dict.
    """
    from api.models.cf_models import Campaigns, CampaignStatus, Donations, DonationStatus, Users
    from api import db
    if not amount or amount <= 0:
        raise ValueError("Amount must be greater than 0")

    try:
        status_enum = (
            status if isinstance(status, DonationStatus) else DonationStatus(status)
        )
    except ValueError:
        raise ValueError(f"Invalid donation status: {status}")

    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"Could not find campaign with campaign id: {campaign_id}")

    # Check if campaign is active and accepting donations
    if campaign.status != CampaignStatus.active:
        raise ValueError(
            f"Campaign is not active. Current status: {campaign.status.value}"
        )

    # Calculate total pending and completed donations
    total_committed = (
        db.session.query(db.func.sum(Donations.amount))
        .filter(
            Donations.campaign_id == campaign_id,
            Donations.status.in_([DonationStatus.pending, DonationStatus.completed]),
        )
        .scalar()
        or 0
    )

    # Check if goal already reached (considering pending donations)
    if total_committed >= campaign.goal_amount:
        raise ValueError(
            "Cannot donate to a campaign that has already reached its goal amount (including pending donations)."
        )

    # Check if this donation would exceed the goal
    if total_committed + amount > campaign.goal_amount:
        available = campaign.goal_amount - total_committed
        raise ValueError(
            f"Donation amount exceeds the campaign's remaining goal. Maximum allowed: {available}"
        )
    
    user_donating = Users.query.get(user_id)
    
    if user_donating.role.value != 'donor':
        raise ValueError(
            "Only a user with the role donor can donate"
        )

    donation = Donations(
        user_id=user_id, campaign_id=campaign_id, amount=amount, status=status_enum
    )

    db.session.add(donation)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not create donation: {str(e)}")

    return donation.to_dict()


def view_donation_by_donation_id(donation_id):
    """Return a donation by id as a dict. Raises ValueError if not found.
    """
    donation = Donations.query.get(donation_id)
    if not donation:
        raise ValueError(f"Could not find donation with donation id: {donation_id}")

    return donation.to_dict()


def view_all_donations_by_user(user_id):
    """List all donations made by a user and return as list of dicts.
    Raises ValueError if no donations are found.
    """
    donations = Donations.query.filter_by(user_id=user_id).all()
    if not donations:
        raise ValueError(f"No donation found by user id: {user_id}")

    return [donation.to_dict() for donation in donations]


def view_all_donations_by_campaign(campaign_id):
    """List all donations for a campaign and return as list of dicts.
    Raises ValueError if none found.
    """
    donations = Donations.query.filter(
    (Donations.campaign_id == campaign_id) & (Donations.status == 'completed')
    ).all()

    if not donations:
        raise ValueError(f"No donation found by campaign id: {campaign_id}")

    return [donation.to_dict() for donation in donations]



def updateDonationStatus(donation_id, status):
    """Update the status of a donation with validation and return its dict.
    Prevents manual completion that should be triggered by payments.
    """
    donation = Donations.query.get(donation_id)

    if not donation:
        raise ValueError(f"Could not find donation with donation id: {donation_id}")

    try:
        new_status = (
            status if isinstance(status, DonationStatus) else DonationStatus(status)
        )
    except ValueError:
        raise ValueError(f"Invalid donation status: {status}")

    # Prevent manual completion - should only happen through payment
    if (
        new_status == DonationStatus.COMPLETED
        and donation.status != DonationStatus.COMPLETED
    ):
        raise ValueError(
            "Cannot manually mark donation as COMPLETED. Donations are completed through the payment system."
        )

    donation.status = new_status

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update donation status. Error: {str(e)}")

    return donation.to_dict()


def cancel_donation(donation_id):
    """Cancel a non-completed donation and return its dict.
    Prevents canceling when already completed.
    """
    donation = Donations.query.get(donation_id)

    if not donation:
        raise ValueError("Donation not found")

    # Prevent canceling completed donations
    if donation.status == DonationStatus.COMPLETED:
        raise ValueError(
            "Cannot cancel a completed donation. The payment has already been processed and added to the campaign."
        )

    old_status = donation.status
    donation.status = DonationStatus.CANCELLED

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not cancel the donation. Error: {str(e)}")

    return donation.to_dict()


def get_donation_statistics_by_campaign(campaign_id):
    """Return donation statistics (counts and totals) for a campaign by status.
    Useful for reporting and dashboards.
    """
    from api.models.cf_models import Campaigns

    campaign = Campaigns.query.get(campaign_id)
    if not campaign:
        raise ValueError(f"Campaign not found with id {campaign_id}")

    stats = {
        "campaign_id": campaign_id,
        "goal_amount": float(campaign.goal_amount),
        "raised_amount": float(campaign.raised_amount),
    }

    for status in DonationStatus:
        donations = Donations.query.filter_by(
            campaign_id=campaign_id, status=status
        ).all()

        count = len(donations)
        total = sum(float(d.amount) for d in donations)

        stats[f"{status.value.lower()}_count"] = count
        stats[f"{status.value.lower()}_total"] = total

    return stats
from api import db
from api.models.cf_models import Donations, Campaigns, Payments, CampaignPaymentStatus, CampaignStatus, DonationStatus
from sqlalchemy.exc import IntegrityError
from datetime import datetime


def create_payment(donation_id, amount, payment_method, payment_status):
    """Create a payment for a donation, update donation/campaign on completion.
    Ensures only one payment exists per donation and validates amounts/status.
    """
    if not amount or amount <= 0:
        raise ValueError("Amount must be greater than 0.")

    if not payment_method:
        raise ValueError("Payment method cannot be empty.")

    donation = Donations.query.get(donation_id)
    if not donation:
        raise ValueError(f"Donation not found with id {donation_id}")

    # CRITICAL: Check if payment already exists for this donation
    existing_payment = Payments.query.filter_by(donation_id=donation_id).first()
    if existing_payment:
        raise ValueError(f"A payment already exists for donation {donation_id}. Cannot create duplicate payment.")

    if float(amount) != float(donation.amount):
        raise ValueError(f"Payment amount {amount} does not match donation amount {donation.amount}")

    try:
        payment_status = (
            payment_status
            if isinstance(payment_status, CampaignPaymentStatus)
            else CampaignPaymentStatus(payment_status)
        )
    except ValueError:
        raise ValueError(
            f"Invalid payment status. Must be one of: {[s.value for s in CampaignPaymentStatus]}"
        )

    payment = Payments(
        donation_id=donation_id,
        amount=amount,
        payment_method=payment_method,
        payment_status=payment_status,
    )
    db.session.add(payment)

    if payment_status == CampaignPaymentStatus.COMPLETED:
        donation.status = DonationStatus.COMPLETED

        campaign = Campaigns.query.get(donation.campaign_id)
        if not campaign:
            db.session.rollback()
            raise ValueError(f"Campaign not found for donation id {donation_id}")

        campaign.raised_amount += float(amount)

        if campaign.raised_amount >= campaign.goal_amount:
            campaign.raised_amount = campaign.goal_amount
            campaign.status = CampaignStatus.COMPLETED

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise RuntimeError("Payment creation failed due to database integrity error.")
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not create payment: {str(e)}")

    return payment.to_dict()


def view_payment_by_payment_id(payment_id):
    """Return a payment by its id as a dict. Raises ValueError if not found.
    """
    payment = Payments.query.get(payment_id)
    if not payment:
        raise ValueError(f"Could not find payment with payment id: {payment_id}")
    return payment.to_dict()


def view_payment_by_donation_id(donation_id):
    """Get the payment for a donation; returns a single payment dict.
    Raises ValueError if no matching payment exists.
    """
    payment = Payments.query.filter_by(donation_id=donation_id).first()
    if not payment:
        raise ValueError(f"No payment found for donation id: {donation_id}")
    return payment.to_dict()


def view_all_payments():
    """Return all payments as a list of dicts. Raises ValueError if none exist.
    """
    payments = Payments.query.all()
    if not payments:
        raise ValueError("No payments found.")
    return [p.to_dict() for p in payments]


def view_all_payments_by_donation(donation_id):
    """Deprecated: returns payments by donation id (kept for compatibility).
    Prefer view_payment_by_donation_id() going forward.
    """
    payments = Payments.query.filter_by(donation_id=donation_id).all()
    if not payments:
        raise ValueError(f"No payments found for donation id: {donation_id}")
    return [p.to_dict() for p in payments]


def update_payment_status(payment_id, new_status):
    """Change a payment's status and update donation/campaign if completed.
    Prevents duplicate or invalid transitions to preserve accounting.
    """
    payment = Payments.query.get(payment_id)
    if not payment:
        raise ValueError(f"Payment with payment id {payment_id} not found.")

    try:
        new_status = (
            new_status
            if isinstance(new_status, CampaignPaymentStatus)
            else CampaignPaymentStatus(new_status)
        )
    except ValueError:
        raise ValueError(
            f"Invalid payment status. Must be one of: {[s.value for s in CampaignPaymentStatus]}"
        )

    old_status = payment.payment_status

    # CRITICAL: Prevent duplicate COMPLETED status updates
    if old_status == CampaignPaymentStatus.COMPLETED and new_status == CampaignPaymentStatus.COMPLETED:
        return payment.to_dict()
    
    # Prevent changing from COMPLETED to another status (would break accounting)
    if old_status == CampaignPaymentStatus.COMPLETED and new_status != CampaignPaymentStatus.COMPLETED:
        raise ValueError("Cannot change status of a completed payment. This would cause data inconsistency.")
    
    payment.payment_status = new_status

    # When payment status changes to COMPLETED, update donation and campaign
    if new_status == CampaignPaymentStatus.COMPLETED and old_status != CampaignPaymentStatus.COMPLETED:
        donation = Donations.query.get(payment.donation_id)
        if not donation:
            db.session.rollback()
            raise ValueError(f"Donation not found for payment id {payment_id}")

        donation.status = DonationStatus.COMPLETED

        campaign = Campaigns.query.get(donation.campaign_id)
        if not campaign:
            db.session.rollback()
            raise ValueError(f"Campaign not found for donation id {donation.donation_id}")
        
        campaign.raised_amount += float(payment.amount)
        
        # Check if campaign goal is reached
        if campaign.raised_amount >= campaign.goal_amount:
            campaign.raised_amount = campaign.goal_amount
            campaign.status = CampaignStatus.COMPLETED
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update payment status: {str(e)}")

    return payment.to_dict()


def update_payment_method(payment_id, new_method):
    """Update the payment method for a non-completed payment.
    Returns the updated payment dict.
    """
    payment = Payments.query.get(payment_id)
    if not payment:
        raise ValueError(f"Payment with payment id {payment_id} not found.")

    if not new_method:
        raise ValueError("Payment method cannot be empty.")
    
    # Prevent changing payment method after completion
    if payment.payment_status == CampaignPaymentStatus.COMPLETED:
        raise ValueError("Cannot change payment method of a completed payment.")

    payment.payment_method = new_method
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update payment method: {str(e)}")

    return payment.to_dict()


def delete_payment(payment_id):
    """Delete a non-completed payment record and return confirmation.
    Raises ValueError for missing or completed payments.
    """
    payment = Payments.query.get(payment_id)
    if not payment:
        raise ValueError(f"Payment with payment id {payment_id} not found.")

    if payment.payment_status == CampaignPaymentStatus.COMPLETED:
        raise ValueError("Cannot delete a completed payment. This would cause data inconsistency.")

    try:
        db.session.delete(payment)
        db.session.commit()
        return {"message": f"Payment with id {payment_id} deleted successfully."}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not delete payment: {str(e)}")


def get_total_payments():
    """Return the total number of payments in the system.
    Returns a dict with 'total_payments'.
    """
    total = db.session.query(db.func.count(Payments.payment_id)).scalar()
    return {"total_payments": total or 0}


def get_total_payment_amount():
    """Return the sum of amounts for COMPLETED payments only.
    Returns a dict with 'total_amount'.
    """
    total = db.session.query(db.func.sum(Donations.amount)).filter(
        Payments.payment_status == CampaignPaymentStatus.COMPLETED
    ).scalar()
    return {"total_amount": float(total or 0)}


def filter_payments_by_status(status):
    """Return payments filtered by payment status enum.
    Raises ValueError for invalid status strings.
    """
    try:
        status_enum = (
            status
            if isinstance(status, CampaignPaymentStatus)
            else CampaignPaymentStatus(status)
        )
    except ValueError:
        raise ValueError(
            f"Invalid payment status. Must be one of: {[s.value for s in CampaignPaymentStatus]}"
        )

    payments = Payments.query.filter_by(payment_status=status_enum).all()
    if not payments:
        raise ValueError(f"No payments found with status: {status_enum.value}")

    return [p.to_dict() for p in payments]


def filter_payments_by_method(method):
    """Filter payments by payment method string (case-insensitive).
    Returns a list of payment dicts.
    """
    payments = Payments.query.filter(
        db.func.lower(Payments.payment_method) == method.lower()
    ).all()
    if not payments:
        raise ValueError(f"No payments found using method: {method}")
    return [p.to_dict() for p in payments]


def check_payment_exists_for_donation(donation_id):
    """Return True if a payment record exists for the given donation.
    Useful to prevent duplicate payment processing.
    """
    payment = Payments.query.filter_by(donation_id=donation_id).first()
    return payment is not None
from api import donations_ns, db
from flask_restx import Resource
from api.fields.donationsFields import donations_data
from api.helpers.security_helper import jwt_required
from flask import request
from api.helpers.donation_helper import create_donation,view_all_donations_by_campaign
from api.models.cf_models import Donations,Campaigns,CampaignStatus,CampaignPaymentStatus,Payments
from sqlalchemy import func,distinct
from sqlalchemy.exc import SQLAlchemyError

@donations_ns.route('')
class Donate(Resource):
    # @jwt_required
    @donations_ns.doc("Make a donation to a campaign")
    @donations_ns.expect(donations_data)
    def post(self):
        data = request.json
        try:
            # Create donation
            donation = Donations(
                user_id=data["user_id"],
                campaign_id=data["campaign_id"],
                amount=data["amount"],
                status="pending"  
            )
            db.session.add(donation)

            
            payment = Payments(
                donation=donation,
                payment_method="card",
                payment_status=CampaignPaymentStatus.pending
            )
            db.session.add(payment)

            campaign = Campaigns.query.get(data["campaign_id"])
            campaign.raised_amount += data["amount"]


            donation.status = "completed"
            payment.payment_status = CampaignPaymentStatus.successful
            db.session.commit()  

            return {"message": "Donation successful"}

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

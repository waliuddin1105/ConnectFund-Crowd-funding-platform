from api import db, creator_ns
from flask import request
from flask_restx import Resource
from api.helpers.security_helper import jwt_required
from api.models.cf_models import Users, Campaigns, Donations, CampaignStatus
from sqlalchemy import func, desc

from decimal import Decimal

@creator_ns.route('/dashboard')
class DisplayCreatorDashboard(Resource):
    @jwt_required
    @creator_ns.doc('Creator Dashboard')
    def get(self):
        try:
            from flask import g

            creator = Users.query.get(g.user_id)

            if not creator:
                return {"Error": "No such user exists"}, 400
            
            role = creator.role.value.lower()
            if role != 'creator':
                return {"Error": "Nothing to show"}, 403
            
            campaigns = Campaigns.query.filter(
                Campaigns.creator_id == creator.user_id, Campaigns.status == CampaignStatus.active
            ).all()

            total_raised = 0
            active_campaigns = len(campaigns)

            for campaign in campaigns:
                campaign_total = db.session.query(db.func.sum(Donations.amount))\
                                .filter(Donations.campaign_id == campaign.campaign_id).scalar()
                if campaign_total is None:
                    campaign_total = 0
                # convert Decimal to float
                total_raised += float(campaign_total)
                
            total_donors = db.session.query(func.count(func.distinct(Donations.user_id)))\
                            .join(Campaigns, Campaigns.campaign_id == Donations.campaign_id)\
                            .filter(Campaigns.creator_id == creator.user_id,
                                    Campaigns.status == CampaignStatus.active).scalar()
            
            if not total_donors:
                total_donors = 0

            recent_donation = db.session.query(Donations)\
                                .join(Campaigns, Campaigns.campaign_id == Donations.campaign_id)\
                                .join(Users, Donations.user_id == Users.user_id)\
                                .filter(Campaigns.creator_id == creator.user_id,
                                        Campaigns.status == CampaignStatus.active)\
                                .order_by(desc(Donations.created_at)).first()
            
            if recent_donation:
                recent_donation_amount = {
                    "donor_id": recent_donation.user_id,
                    "amount": float(recent_donation.amount)  # convert Decimal to float
                }
            else:
                recent_donation_amount = {
                    "donor_id": None,
                    "amount": 0
                }
            
            available_to_withdraw = db.session.query(db.func.sum(Campaigns.raised_amount))\
                                    .filter(Campaigns.creator_id == creator.user_id,
                                            Campaigns.status == CampaignStatus.completed).scalar()
            if not available_to_withdraw:
                available_to_withdraw = 0
            else:
                available_to_withdraw = float(available_to_withdraw)  # convert Decimal to float
            
            return {
                "Success": {
                    "total_raised": total_raised,
                    "active_campaigns": active_campaigns,
                    "total_donors": total_donors,
                    "recent_donation": recent_donation_amount,
                    "available": available_to_withdraw
                }
            }, 200
        
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500
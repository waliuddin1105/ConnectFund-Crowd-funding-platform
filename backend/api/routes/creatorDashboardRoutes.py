from api import db, creator_ns
from flask import request
from flask_restx import Resource
from api.helpers.security_helper import jwt_required
from api.models.cf_models import Users, Campaigns, Donations, CampaignStatus
from sqlalchemy import func, desc
from api.helpers.cache_helper import cache

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
            
            # Single aggregated query: total_raised and active_campaigns count
            agg = (
                db.session.query(
                    func.count(Campaigns.campaign_id).label("active_campaigns"),
                    func.coalesce(func.sum(Donations.amount), 0).label("total_raised"),
                    func.count(func.distinct(Donations.user_id)).label("total_donors"),
                )
                .outerjoin(Donations, Donations.campaign_id == Campaigns.campaign_id)
                .filter(
                    Campaigns.creator_id == creator.user_id,
                    Campaigns.status == CampaignStatus.active,
                )
                .first()
            )

            total_raised = float(agg.total_raised or 0)
            active_campaigns = int(agg.active_campaigns or 0)
            total_donors = int(agg.total_donors or 0)

            recent_donation = (
                db.session.query(Donations)
                .join(Campaigns, Campaigns.campaign_id == Donations.campaign_id)
                .filter(
                    Campaigns.creator_id == creator.user_id,
                    Campaigns.status == CampaignStatus.active,
                )
                .order_by(desc(Donations.created_at))
                .first()
            )

            recent_donation_amount = (
                {"donor_id": recent_donation.user_id, "amount": float(recent_donation.amount)}
                if recent_donation
                else {"donor_id": None, "amount": 0}
            )

            available_to_withdraw = db.session.query(db.func.sum(Campaigns.raised_amount))\
                                    .filter(Campaigns.creator_id == creator.user_id,
                                            Campaigns.status == CampaignStatus.completed).scalar()
            available_to_withdraw = float(available_to_withdraw or 0)
            
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
        
@creator_ns.route('/campaigns') 
class DisplayCreatorCampaigns(Resource):
    @jwt_required
    @creator_ns.doc("Displaying creator campaigns")
    def get(self):
        try:
            from flask import g
            creator = Users.query.get(g.user_id)

            if not creator:
                return {"Error" : "No such user exists"}, 400
            
            role = creator.role.value.lower()

            if role != 'creator':
                return {"Error" : "Nothing to show"}, 403
            
            # Single query: campaigns + donor count per campaign via subquery
            donor_count_sub = (
                db.session.query(
                    Donations.campaign_id,
                    func.count(func.distinct(Donations.user_id)).label("total_donors"),
                )
                .group_by(Donations.campaign_id)
                .subquery()
            )

            rows = (
                db.session.query(
                    Campaigns,
                    func.coalesce(donor_count_sub.c.total_donors, 0).label("total_donors"),
                )
                .outerjoin(donor_count_sub, Campaigns.campaign_id == donor_count_sub.c.campaign_id)
                .filter(
                    Campaigns.creator_id == creator.user_id,
                    Campaigns.status == CampaignStatus.active,
                )
                .all()
            )
            
            campaigns_list = []
            for campaign, total_donors in rows:
                campaign_data = campaign.to_dict()
                campaign_data['total_donors'] = int(total_donors)
                campaigns_list.append(campaign_data)
            
            return {
                "user_id" : creator.user_id,
                "campaigns" : campaigns_list
            }, 200
        
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500

@creator_ns.route('/recent-donations')
class RecentDonations(Resource):
    @jwt_required
    @creator_ns.doc("View recent donations for a creator's campaign")
    def get(self):
        from flask import g
        try:
            creator = Users.query.get(g.user_id)

            if not creator:
                return {"Error" : "No such user exists"}, 400
            
            role = creator.role.value.lower()

            if role != 'creator':
                return {"Error" : "Nothing to show"}, 403
            
            recent_donations = (
                db.session.query(Donations)
                .join(Campaigns, Campaigns.campaign_id == Donations.campaign_id)
                .join(Users, Donations.user_id == Users.user_id)
                .filter(
                    Campaigns.creator_id == creator.user_id,
                    Campaigns.status == CampaignStatus.active,
                )
                .order_by(desc(Donations.created_at))
                .all()
            )
            
            return {
                "user_id": creator.user_id,
                "recent_donations": [d.to_dict() for d in recent_donations],
            }, 200
        
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500

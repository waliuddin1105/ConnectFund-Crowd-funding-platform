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


@donations_ns.route('/recent-donors/<int:campaign_id>')
class RecentDonors(Resource):
    def get(self, campaign_id):
        try:
            all_donations =view_all_donations_by_campaign(campaign_id)
            all_donations.sort(key=lambda d: d['created_at'], reverse=True)

            recent_donations = all_donations[:5]

            
            return {"donors": recent_donations}, 200

        except ValueError:
            return {"donors": []}, 200
        except Exception as e:
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500
        
@donations_ns.route('/donor-stats/<int:donor_id>')
class DonorStats(Resource):
    def get(self, donor_id):
        """Donor Dashboard Stats"""
        total_donated = (
            db.session.query(func.sum(Donations.amount))
            .filter(Donations.user_id == donor_id)
            .scalar()
        )
        total_donated = float(total_donated or 0)

        campaigns_supported = (
            db.session.query(func.count(distinct(Donations.campaign_id)))
            .filter(Donations.user_id == donor_id)
            .scalar()
        )
        campaigns_supported = campaigns_supported or 0

        recent_campaign = (
            db.session.query(
                Campaigns.campaign_id,
                Campaigns.title,
                Donations.created_at,
                Donations.amount
            )
            .join(Donations, Campaigns.campaign_id == Donations.campaign_id)
            .filter(Donations.user_id == donor_id)
            .order_by(Donations.created_at.desc())
            .first()
        ) if total_donated != 0 else None

        completed_campaigns_supported = (
            db.session.query(func.count(distinct(Campaigns.campaign_id)))
            .join(Donations, Campaigns.campaign_id == Donations.campaign_id)
            .filter(
                Donations.user_id == donor_id,
                Campaigns.status == 'completed'
            )
            .scalar()
        )
        completed_campaigns_supported = completed_campaigns_supported or 0

        if campaigns_supported > 0:
            completion_rate = completed_campaigns_supported / campaigns_supported
            impact_score = round(completion_rate * 5, 1)
        else:
            impact_score = 0.0
        response = {
            "total_donated": total_donated,
            "campaigns_supported": campaigns_supported,
            "completed_campaigns_supported": completed_campaigns_supported,
            "impact_score": f"{impact_score}/5",
            "based_on": "your contributions and completed campaigns",
            "recent_campaign": {
                "campaign_id": recent_campaign.campaign_id,
                "title": recent_campaign.title,
                "date": recent_campaign.created_at.isoformat(),
                "amount": float(recent_campaign.amount)  
            } if recent_campaign else None
        }

        return response, 200

@donations_ns.route('/history/<int:donor_id>')
class DonationHistory(Resource):
    def get(self, donor_id):
        """Get Donation History of a donor"""
        donations = (
            db.session.query(
                Campaigns.image,
                Campaigns.title,
                Campaigns.category,
                Campaigns.created_at,
                Campaigns.status,
                Donations.amount,
                Donations.created_at.label("donation_date")
            )
            .join(Donations, Campaigns.campaign_id == Donations.campaign_id)
            .filter(
                Donations.user_id == donor_id,
                Campaigns.status != CampaignStatus.pending  
            )
            .order_by(Donations.created_at.desc())
            .all()
        )

        response_data = []
        for d in donations:
            response_data.append({
                "image": d.image,
                "title": d.title,
                "category": d.category.value if hasattr(d.category, "value") else str(d.category),
                "status": d.status.value if hasattr(d.status, "value") else str(d.status),
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "donation_date": d.donation_date.isoformat() if d.donation_date else None,
                "amount": float(d.amount),
            })

        return {"donation_history": response_data}, 200


@donations_ns.route('/active-campaigns/<int:donor_id>')
class GetActiveCampaigns(Resource):
    def get(self, donor_id):
        try:
            results = (
                db.session.query(
                    Campaigns.campaign_id,
                    Campaigns.title,
                    Campaigns.goal_amount,
                    Campaigns.raised_amount,
                    Campaigns.status
                )
                .join(Donations, Donations.campaign_id == Campaigns.campaign_id)
                .filter(
                    Campaigns.status == CampaignStatus.active,
                    Donations.user_id == donor_id
                )
                .all()
            )

            campaigns_list = [
                {
                    "campaign_id": r.campaign_id,
                    "title": r.title,
                    "goal_amount": float(r.goal_amount),
                    "raised_amount": float(r.raised_amount),
                    "status": r.status.value
                }
                for r in results
            ]

            return {"active_campaigns": campaigns_list}, 200

        except Exception as e:
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500

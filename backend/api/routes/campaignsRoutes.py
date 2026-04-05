
from flask_restx import Resource
from api.models.cf_models import (
    Users,
    CampaignCategory,
    Campaigns,  
    Comments,
    CampaignStatus,
    Payments,
    UserRole,
    Donations,
    CampaignUpdates,AdminReviews
)
from flask import jsonify, request
from api import db, campaigns_ns
from api.models.cf_models import Campaigns, Users
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from datetime import datetime
from ..helpers import campaign_helper
from flask import g
from api.helpers.security_helper import jwt_required

@campaigns_ns.route('/') # AllCampaigns.jsx
class AllCampaigns(Resource):
    def get(self):
        """Get all campaigns with their creator's name"""
        try:
            campaigns = (
                db.session.query(
                    Campaigns.campaign_id,
                    Campaigns.title,
                    Campaigns.description,
                    Campaigns.category,
                    Campaigns.goal_amount,
                    Campaigns.raised_amount,
                    Campaigns.status,
                    Campaigns.created_at,
                    Campaigns.updated_at,
                    Campaigns.image,
                    Users.username.label("creator_name")
                )
                .join(Users, Campaigns.creator_id == Users.user_id)
                .filter(Campaigns.status != 'pending')
                .all()
            )
            
            campaigns_list = [{
                "campaign_id": c.campaign_id,
                "title": c.title,
                "description": c.description,
                "category": c.category.value if hasattr(c.category, "value") else c.category,
                "goal_amount": float(c.goal_amount) if c.goal_amount else 0.0,
                "raised_amount": float(c.raised_amount) if c.raised_amount else 0.0,
                "status": c.status.value if hasattr(c.status, "value") else c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                "creator_name": c.creator_name,
                "image": c.image
            } for c in campaigns]

            response = {
                "success": True,
                "campaigns": campaigns_list
            }

            return response, 200

        except Exception as e:
            print("Error fetching campaigns:", e)
            return {"success": False, "error": str(e)}, 500


@campaigns_ns.route('/create')
class CreateCampaign(Resource):
    def options(self):
        """Handle CORS preflight for create campaign"""
        return {'status': 'ok'}, 200
    
    def post(self):
        """Create a new campaign"""
        try:
            data = request.get_json()
            print("Received data:", data)

            default_img_url = 'https://res.cloudinary.com/sajjadahmed/image/upload/v1761242807/klxazxpkipxvyxuurpaq.png'

            goal_amount = float(data['goal_amount'])
            image = data.get('image') or default_img_url
            category_value = data['category'].strip().lower()
            status_value = data.get('status', 'pending').strip().lower()

            try:
                category_enum = CampaignCategory(category_value)
            except ValueError:
                return {"success": False, "error": f"Invalid category '{category_value}'"}, 400

            try:
                status_enum = CampaignStatus(status_value)
            except ValueError:
                return {"success": False, "error": f"Invalid status '{status_value}'"}, 400

            # Handle date parsing
            start_date_str = data['start_date']
            end_date_str = data['end_date']
            
            # Remove 'Z' and parse
            if isinstance(start_date_str, str):
                start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            else:
                start_date = start_date_str
                
            if isinstance(end_date_str, str):
                end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
            else:
                end_date = end_date_str

            print('Creating campaign...')
            campaign = Campaigns(
                creator_id=data['creator_id'],
                title=data['title'],
                description=data['description'],
                image=image,
                category=category_enum,
                goal_amount=goal_amount,
                raised_amount=0,
                start_date=start_date,
                end_date=end_date,
                status=status_enum
            )


            db.session.add(campaign)
            db.session.commit()
            return {
                "success": True,
                "message": "Campaign created successfully",
                "campaign": campaign.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            print('Error creating campaign:', str(e))
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}, 500


@campaigns_ns.route('/fully-funded')
class FullyFundedCampaigns(Resource):
    def get(self):
        """return fully-funded campaigns"""
        try:
            campaigns = campaign_helper.view_all_completed_campaigns()
            return {
                "success": True,
                "count": len(campaigns),
                "campaigns": campaigns
            }, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500


@campaigns_ns.route('/<int:campaign_id>')
class CampaignOperations(Resource):
    def get(self, campaign_id):
        """get campaign by id"""
        try:
            campaign = campaign_helper.view_campaign_by_campaign_id(campaign_id)
            return {
                "success": True,
                "campaign": campaign
            }, 200
        except ValueError as ve:
            return {"success": False, "error": str(ve)}, 404
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }, 500
    
    def delete(self, campaign_id):
        """Delete a campaign"""
        try:
            result = campaign_helper.delete_campaign(campaign_id)
            return {
                "success": True,
                "message": result["message"]
            }, 200
        except ValueError as ve:
            return {"success": False, "error": str(ve)}, 404
        except Exception as e:
            return {"success": False, "error": str(e)}, 500


@campaigns_ns.route('')
class CreatorCampaignList(Resource):
    def get(self):
        """Get campaigns by creator"""
        creator_id = request.args.get('creator_id')

        try:
            res = campaign_helper.view_all_campaigns_by_creator(creator_id)
            return {
                "success": True,
                "count": len(res),
                "data": res
            }, 200
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }, 500


@campaigns_ns.route('/<int:campaign_id>/comments')
class GetCampaignComments(Resource):
    def get(self, campaign_id):
        """Get all comments of a campaign"""
        try:
            query = text("""
                SELECT 
                    u.username, 
                    u.profile_image, 
                    cm.comment_id, 
                    cm.content, 
                    cm.created_at, 
                    cm.likes
                FROM comments cm
                JOIN users u ON u.user_id = cm.user_id
                JOIN campaigns c ON c.campaign_id = cm.campaign_id
                WHERE c.campaign_id = :campaign_id
                ORDER BY cm.created_at DESC
            """)
            result = db.session.execute(query, {"campaign_id": campaign_id}).fetchall()
            comments = [dict(row._mapping) for row in result]
            return {"success": True, "comments": comments}, 200
        except ValueError as ve:
            return {"success": False, "error": str(ve)}, 404
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }, 500

#API: POST http://{BACKEND_URL}/campaigns/comments/{comment_id}/like
@campaigns_ns.route('/comments/<int:comment_id>/like')
class CommentLike(Resource):
    def post(self, comment_id):
        """Post a like on a comment"""
        try:
            comment = Comments.query.filter_by(comment_id=comment_id).first()

            if not comment:
                raise ValueError(f"No comment found with id {comment_id}")

            comment.likes = (comment.likes or 0) + 1

            db.session.commit()

            return {
                "success": True,
                "comment_id": comment_id,
                "likes": comment.likes
            }, 200

        except ValueError as ve:
            db.session.rollback()
            return {"success": False, "error": str(ve)}, 404

        except Exception as e:
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500

# API: POST http://{BACKEND_URL}/campaigns/fully-funded
@campaigns_ns.route('/fully-funded')
class FullyFundedCampaigns(Resource): #Home.jsx
    def get(self):
        """Get fully funded campaigns"""
        try:
            campaigns = (
                db.session.query(
                    Campaigns.campaign_id,
                    Campaigns.title,
                    Campaigns.description,
                    Campaigns.category,
                    Campaigns.goal_amount,
                    Campaigns.raised_amount,
                    Campaigns.status,
                    Campaigns.created_at,
                    Campaigns.updated_at,
                    Campaigns.image,
                    Users.username.label("creator_name")
                )
                .join(Users, Campaigns.creator_id == Users.user_id)
                .filter(Campaigns.status == 'completed')
                .all()
            )
            
            campaigns_list = [{
                "campaign_id": c.campaign_id,
                "title": c.title,
                "description": c.description,
                "category": c.category.value if hasattr(c.category, "value") else c.category,
                "goal_amount": float(c.goal_amount) if c.goal_amount else 0.0,
                "raised_amount": float(c.raised_amount) if c.raised_amount else 0.0,
                "status": c.status.value if hasattr(c.status, "value") else c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                "creator_name": c.creator_name,
                "image": c.image
            } for c in campaigns]

            response = {
                "success": True,
                "campaigns": campaigns_list
            }

            return response, 200

        except Exception as e:
            print("Error fetching campaigns:", e)
            return {"success": False, "error": str(e)}, 500
        
@campaigns_ns.route('/stats') #for Home page
class CampaignStats(Resource):
    def get(self):
        try:
            # total raised
            total_raised = db.session.query(func.sum(Donations.amount))\
                .filter(Payments.payment_status == 'successful').scalar() or 0
            total_raised = float(total_raised)

            # total donors
            total_donors = db.session.query(func.count(Users.user_id))\
                .filter(Users.role == 'donor').scalar() or 0

            # success rate
            total_campaigns = db.session.query(func.count(Campaigns.campaign_id)).scalar() or 1
            completed_campaigns = db.session.query(func.count(Campaigns.campaign_id))\
                .filter(Campaigns.status == "completed").scalar() or 0

            success_rate = (completed_campaigns / total_campaigns) * 100

            # active campaigns
            active_campaigns = db.session.query(func.count(Campaigns.campaign_id))\
                .filter(Campaigns.status == 'active').scalar() or 0

            return {
                "success": True,
                "stats": {
                    "total_raised": round(total_raised, 2),
                    "total_donors": total_donors,
                    "success_rate": round(success_rate, 2),
                    "active_campaigns": active_campaigns
                }
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500

@campaigns_ns.route('/get-updates/<int:campaign_id>')
class GetUpdates(Resource):
    def get(self, campaign_id):
        try:
            query = (
                db.session.query(CampaignUpdates)
                .filter(CampaignUpdates.campaign_id == campaign_id)
                .all()
            )

            # Convert all updates to dictionary form
            updates = [u.to_dict() for u in query]

            return {"success": True, "updates": updates}, 200

        except ValueError as ve:
            return {"success": False, "error": str(ve)}, 404
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

@campaigns_ns.route('/post-update')
class PostUpdates(Resource):
    @jwt_required
    def post(self):
        try:
            data = request.get_json()
            campaign_id = data.get("campaign_id")
            content = data.get("content", "").strip()

            if not campaign_id or not content:
                return {"success": False, "message": "Campaign ID and content are required."}, 400

            creator = Users.query.get(g.user_id)
            if not creator:
                return {"success": False, "message": "User not found."}, 400

            if creator.role.value.lower() != "creator":
                return {"success": False, "message": "Only creators can post updates."}, 403

            campaign = Campaigns.query.get(campaign_id)
            if not campaign or campaign.creator_id != creator.user_id:
                return {"success": False, "message": "Campaign not found or access denied."}, 404

            new_update = CampaignUpdates(
                campaign_id=campaign_id,
                content=content
            )
            db.session.add(new_update)
            db.session.commit()

            return {"success": True, "message": "Update posted successfully.", "update": new_update.to_dict()}, 201

        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Unexpected error: {str(e)}"}, 500

@campaigns_ns.route('/delete-campaign/<int:campaign_id>')
class DeleteCampaign(Resource):
    @jwt_required
    def delete(self, campaign_id):
        try:
            user = Users.query.get(g.user_id)
            if not user:
                return {"success": False, "message": "User not found."}, 400

            if user.role.value.lower() != "creator":
                return {"success": False, "message": "Only creators can delete campaigns."}, 403

            # Get the campaign
            campaign = Campaigns.query.get(campaign_id)
            if not campaign or campaign.creator_id != user.user_id:
                return {"success": False, "message": "Campaign not found or access denied."}, 404

            # Delete the campaign
            db.session.delete(campaign)
            db.session.commit()

            return {"success": True, "message": "Campaign deleted successfully."}, 200

        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Unexpected error: {str(e)}"}, 500


#Admin Dashboard routes
@campaigns_ns.route('/status/<string:status>')
class CampaignsByStatus(Resource):
    def get(self, status):
        """Get campaigns by status (pending/active/completed/rejected)"""
        try:
            try:
                status_enum = CampaignStatus[status.lower()]
            except KeyError:
                return {"status": "error", "message": "Invalid status value"}, 400

            campaigns = (
                db.session.query(Campaigns)
                .filter(Campaigns.status == status_enum)
                .all()
            )

            result = []

            for c in campaigns:
                campaign_dict = c.to_dict()

                if status_enum == CampaignStatus.rejected:
                    review = (
                        db.session.query(AdminReviews)
                        .filter_by(campaign_id=c.campaign_id)
                        .order_by(AdminReviews.created_at.desc())
                        .first()
                    )

                    campaign_dict["rejection_reason"] = review.comments if review else None
                    campaign_dict["rejected_at"] = (
                        review.created_at.isoformat() if review else None
                    )

                result.append(campaign_dict)

            return {"status": "success", "data": result}, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500


@campaigns_ns.route('/admin-key-stats')
class AdminStats(Resource):
    def get(self):
        """Admin dashboard statistics"""
        try:
            total_campaigns = Campaigns.query.count()

            active_campaigns = Campaigns.query.filter_by(
                status=CampaignStatus.active
            ).count()

            total_raised = db.session.query(
                db.func.coalesce(db.func.sum(Donations.amount), 0)
            ).scalar()
            total_raised = float(total_raised)

            total_users = Users.query.count()
            total_creators = Users.query.filter_by(role="creator").count()
            total_donors = Users.query.filter_by(role="donor").count()

            pending_campaigns = Campaigns.query.filter_by(
                status=CampaignStatus.pending
            ).count()

            top_campaign = (
                db.session.query(
                    Campaigns.title,
                    db.func.coalesce(db.func.sum(Donations.amount), 0).label("raised")
                )
                .join(Donations, Campaigns.campaign_id == Donations.campaign_id, isouter=True)
                .group_by(Campaigns.title)
                .order_by(db.desc("raised"))
                .first()
            )

            if top_campaign:
                top_campaign_title = top_campaign.title
                top_campaign_raised = float(top_campaign.raised)
            else:
                top_campaign_title = None
                top_campaign_raised = 0

            return {
                "status": "success",
                "data": {
                    "total_campaigns": {
                        "count": total_campaigns,
                        "active": active_campaigns
                    },
                    "total_raised": total_raised,
                    "total_users": {
                        "count": total_users,
                        "creators": total_creators,
                        "donors": total_donors
                    },
                    "pending_campaigns": pending_campaigns,
                    "top_campaign": {
                        "title": top_campaign_title,
                        "raised": top_campaign_raised
                    }
                }
            }, 200

        except Exception as e:
            return {"status": "error", "message": str(e)}, 500

@campaigns_ns.route('/get-creators')
class CreatorsData(Resource):
    def get(self):
        """Fetch all creator statistics with pagination"""
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))

            query = db.session.query(Users).filter(Users.role == UserRole.creator)

            total_items = query.count()
            total_pages = (total_items + per_page - 1) // per_page

            creators = query.offset((page - 1) * per_page).limit(per_page).all()

            result = []

            for creator in creators:
                try:
                    campaign_count = (
                        db.session.query(Campaigns)
                        .filter_by(creator_id=creator.user_id)
                        .count()
                    )

                    total_raised = (
                        db.session.query(db.func.sum(Campaigns.raised_amount))
                        .filter(Campaigns.creator_id == creator.user_id)
                        .scalar()
                    )
                    total_raised = float(total_raised or 0)

                    creator_dict = {
                        "creator_id": creator.user_id,
                        "name": creator.username,
                        "email": creator.email,
                        "profile_image": creator.profile_image,
                        "campaigns": campaign_count,
                        "total_raised": total_raised,
                        "join_date": (
                            creator.created_at.strftime("%b %d, %Y")
                            if creator.created_at else None
                        )
                    }

                    result.append(creator_dict)

                except Exception as e:
                    print(f"Error processing creator {creator.user_id}: {str(e)}")
                    continue

            return {
                "status": "success",
                "page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages,
                "data": result
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "status": "error",
                "message": str(e)
            }, 500

@campaigns_ns.route('/get-donors')
class UsersData(Resource):
    def get(self):
        """Fetch all donor statistics with pagination"""
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))

            query = db.session.query(Users).filter(Users.role == UserRole.donor)

            total_items = query.count()
            total_pages = (total_items + per_page - 1) // per_page

            donors = query.offset((page - 1) * per_page).limit(per_page).all()

            result = []

            for donor in donors:
                try:
                    # Total donations made (SUM)
                    total_donations = (
                        db.session.query(db.func.sum(Donations.amount))
                        .filter(Donations.user_id == donor.user_id)
                        .scalar()
                    )
                    total_donations = float(total_donations or 0)

                    # Unique campaigns supported
                    campaigns_supported = (
                        db.session.query(Donations.campaign_id)
                        .filter(Donations.user_id == donor.user_id)
                        .distinct()
                        .count()
                    )

                    donor_dict = {
                        "user_id": donor.user_id,
                        "name": donor.username,
                        "email": donor.email,
                        "profile_image": donor.profile_image,
                        "total_donations": total_donations,
                        "campaigns_supported": campaigns_supported,
                        "join_date": (
                            donor.created_at.strftime("%b %d, %Y")
                            if donor.created_at else None
                        )
                    }

                    result.append(donor_dict)

                except Exception as e:
                    print(f"Error processing donor {donor.user_id}: {str(e)}")
                    continue

            return {
                "status": "success",
                "page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages,
                "data": result
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500



@campaigns_ns.route('/highest-funded')
class HighestFunded(Resource):
    def get(self):
        """Fetch top 5 highest funded campaigns along with donor count"""
        try:
            top_campaigns = (
                db.session.query(Campaigns)
                .order_by(Campaigns.raised_amount.desc())
                .limit(5)
                .all()
            )

            result = []

            for c in top_campaigns:
                donor_count = (
                    db.session.query(func.count(func.distinct(Donations.user_id)))
                    .filter(Donations.campaign_id == c.campaign_id)
                    .scalar()
                )

                campaign_dict = {
                    "campaign_id": c.campaign_id,
                    "title": c.title,
                    "raised_amount": float(c.raised_amount or 0),
                    "donor_count": donor_count or 0,
                    "creator": {
                        "user_id": c.creator.user_id,
                        "username": c.creator.username,
                        "profile_image": c.creator.profile_image,
                    } if c.creator else None,
                }

                result.append(campaign_dict)

            return {"status": "success", "data": result}, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500

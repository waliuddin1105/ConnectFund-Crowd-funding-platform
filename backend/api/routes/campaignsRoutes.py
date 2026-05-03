
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
    CampaignUpdates, AdminReviews
)
from flask import jsonify, request
from api import db, campaigns_ns
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from datetime import datetime
from ..helpers import campaign_helper
from flask import g
from api.helpers.security_helper import jwt_required
from api.helpers.cache_helper import cache


def _row_to_campaign_dict(c):
    return {
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
        "image": c.image,
    }


@campaigns_ns.route('/') # AllCampaigns.jsx
class AllCampaigns(Resource):
    @campaigns_ns.param('page', 'Page number (default: returns all)')
    @campaigns_ns.param('per_page', 'Items per page (default: 20, max: 100)')
    @campaigns_ns.param('category', 'Filter by category (optional)')
    def get(self):
        """Get campaigns with optional pagination and category filter"""
        try:
            page = request.args.get('page', type=int)
            per_page = min(request.args.get('per_page', 20, type=int), 100)
            category_filter = request.args.get('category')

            base_query = (
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
            )

            if category_filter:
                try:
                    cat_enum = CampaignCategory(category_filter.strip().lower())
                    base_query = base_query.filter(Campaigns.category == cat_enum)
                except ValueError:
                    return {"success": False, "error": f"Invalid category '{category_filter}'"}, 400

            if page:
                total = base_query.count()
                campaigns = base_query.offset((page - 1) * per_page).limit(per_page).all()
                campaigns_list = [_row_to_campaign_dict(c) for c in campaigns]
                return {
                    "success": True,
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": (total + per_page - 1) // per_page,
                    "campaigns": campaigns_list,
                }, 200
            else:
                campaigns = base_query.all()
                campaigns_list = [_row_to_campaign_dict(c) for c in campaigns]
                return {"success": True, "campaigns": campaigns_list}, 200

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
            cache.delete_memoized(_fully_funded_campaigns_data)
            cache.delete('view//campaigns/stats')
            cache.delete('view//campaigns/admin-key-stats')
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

# API: GET http://{BACKEND_URL}/campaigns/fully-funded
def _fully_funded_campaigns_data():
    """Internal helper – fetches completed campaigns (cached separately)."""
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
    return [{
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


@campaigns_ns.route('/fully-funded')
class FullyFundedCampaigns(Resource):  # Home.jsx
    @campaigns_ns.param('page', 'Page number (optional)')
    @campaigns_ns.param('per_page', 'Items per page (default: 20, max: 100)')
    @cache.cached(timeout=300, key_prefix='fully_funded_campaigns')
    def get(self):
        """Get fully funded campaigns (cached 5 min), supports optional pagination"""
        try:
            page = request.args.get('page', type=int)
            per_page = min(request.args.get('per_page', 20, type=int), 100)
            campaigns_list = _fully_funded_campaigns_data()

            if page:
                total = len(campaigns_list)
                start = (page - 1) * per_page
                campaigns_list = campaigns_list[start: start + per_page]
                return {
                    "success": True,
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": (total + per_page - 1) // per_page,
                    "campaigns": campaigns_list,
                }, 200

            return {"success": True, "campaigns": campaigns_list}, 200

        except Exception as e:
            print("Error fetching campaigns:", e)
            return {"success": False, "error": str(e)}, 500


@campaigns_ns.route('/stats')  # for Home page
class CampaignStats(Resource):
    @cache.cached(timeout=180, key_prefix='campaign_stats')
    def get(self):
        """Platform-wide stats (cached 3 min) — single aggregated query"""
        try:
            from sqlalchemy import case as sa_case

            row = db.session.query(
                func.coalesce(func.sum(Donations.amount), 0).label("total_raised"),
                func.count(func.distinct(Campaigns.campaign_id)).label("total_campaigns"),
                func.sum(
                    sa_case((Campaigns.status == CampaignStatus.completed, 1), else_=0)
                ).label("completed_campaigns"),
                func.sum(
                    sa_case((Campaigns.status == CampaignStatus.active, 1), else_=0)
                ).label("active_campaigns"),
            ).outerjoin(Donations, Donations.campaign_id == Campaigns.campaign_id).first()

            total_donors = (
                db.session.query(func.count(Users.user_id))
                .filter(Users.role == "donor")
                .scalar() or 0
            )

            total_raised = float(row.total_raised or 0)
            total_campaigns = int(row.total_campaigns or 1)
            completed_campaigns = int(row.completed_campaigns or 0)
            active_campaigns = int(row.active_campaigns or 0)
            success_rate = round((completed_campaigns / total_campaigns) * 100, 2)

            return {
                "success": True,
                "stats": {
                    "total_raised": round(total_raised, 2),
                    "total_donors": total_donors,
                    "success_rate": success_rate,
                    "active_campaigns": active_campaigns,
                },
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
            cache.delete_memoized(_fully_funded_campaigns_data)
            cache.delete('fully_funded_campaigns')
            cache.delete('campaign_stats')
            cache.delete('admin_key_stats')
            cache.delete('highest_funded')

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

            query = (
                db.session.query(Campaigns)
                .filter(Campaigns.status == status_enum)
            )

            # Eagerly load latest review for rejected campaigns in a single query
            if status_enum == CampaignStatus.rejected:
                from sqlalchemy import select
                latest_review_subq = (
                    db.session.query(
                        AdminReviews.campaign_id,
                        AdminReviews.comments,
                        AdminReviews.created_at,
                    )
                    .distinct(AdminReviews.campaign_id)
                    .order_by(AdminReviews.campaign_id, AdminReviews.created_at.desc())
                    .subquery()
                )
                rows = (
                    db.session.query(Campaigns, latest_review_subq)
                    .outerjoin(latest_review_subq, Campaigns.campaign_id == latest_review_subq.c.campaign_id)
                    .filter(Campaigns.status == status_enum)
                    .all()
                )
                result = []
                for c, rev_campaign_id, rev_comments, rev_created_at in rows:
                    campaign_dict = c.to_dict()
                    campaign_dict["rejection_reason"] = rev_comments
                    campaign_dict["rejected_at"] = rev_created_at.isoformat() if rev_created_at else None
                    result.append(campaign_dict)
            else:
                campaigns = query.all()
                result = [c.to_dict() for c in campaigns]

            return {"status": "success", "data": result}, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500


@campaigns_ns.route('/admin-key-stats')
class AdminStats(Resource):
    @cache.cached(timeout=120, key_prefix='admin_key_stats')
    def get(self):
        """Admin dashboard statistics (cached 2 min) — single aggregated query"""
        try:
            from sqlalchemy import case as sa_case

            # Aggregate campaign counts and total raised in one pass
            campaign_row = db.session.query(
                func.count(Campaigns.campaign_id).label("total_campaigns"),
                func.sum(
                    sa_case((Campaigns.status == CampaignStatus.active, 1), else_=0)
                ).label("active_campaigns"),
                func.sum(
                    sa_case((Campaigns.status == CampaignStatus.pending, 1), else_=0)
                ).label("pending_campaigns"),
            ).first()

            total_raised = float(
                db.session.query(db.func.coalesce(db.func.sum(Donations.amount), 0)).scalar()
            )

            # Aggregate user counts in one pass
            user_row = db.session.query(
                func.count(Users.user_id).label("total_users"),
                func.sum(sa_case((Users.role == "creator", 1), else_=0)).label("total_creators"),
                func.sum(sa_case((Users.role == "donor", 1), else_=0)).label("total_donors"),
            ).first()

            top_campaign = (
                db.session.query(
                    Campaigns.title,
                    db.func.coalesce(db.func.sum(Donations.amount), 0).label("raised")
                )
                .join(Donations, Campaigns.campaign_id == Donations.campaign_id, isouter=True)
                .group_by(Campaigns.campaign_id, Campaigns.title)
                .order_by(db.desc("raised"))
                .first()
            )

            return {
                "status": "success",
                "data": {
                    "total_campaigns": {
                        "count": int(campaign_row.total_campaigns or 0),
                        "active": int(campaign_row.active_campaigns or 0),
                    },
                    "total_raised": total_raised,
                    "total_users": {
                        "count": int(user_row.total_users or 0),
                        "creators": int(user_row.total_creators or 0),
                        "donors": int(user_row.total_donors or 0),
                    },
                    "pending_campaigns": int(campaign_row.pending_campaigns or 0),
                    "top_campaign": {
                        "title": top_campaign.title if top_campaign else None,
                        "raised": float(top_campaign.raised) if top_campaign else 0,
                    },
                },
            }, 200

        except Exception as e:
            return {"status": "error", "message": str(e)}, 500

@campaigns_ns.route('/get-creators')
class CreatorsData(Resource):
    def get(self):
        """Fetch all creator statistics with pagination (no N+1 queries)"""
        try:
            page = int(request.args.get("page", 1))
            per_page = min(int(request.args.get("per_page", 10)), 100)

            # Single aggregated subquery for campaign stats per creator
            campaign_stats = (
                db.session.query(
                    Campaigns.creator_id,
                    func.count(Campaigns.campaign_id).label("campaign_count"),
                    func.coalesce(func.sum(Campaigns.raised_amount), 0).label("total_raised"),
                )
                .group_by(Campaigns.creator_id)
                .subquery()
            )

            base_query = (
                db.session.query(
                    Users,
                    func.coalesce(campaign_stats.c.campaign_count, 0).label("campaign_count"),
                    func.coalesce(campaign_stats.c.total_raised, 0).label("total_raised"),
                )
                .outerjoin(campaign_stats, Users.user_id == campaign_stats.c.creator_id)
                .filter(Users.role == UserRole.creator)
            )

            total_items = base_query.count()
            total_pages = (total_items + per_page - 1) // per_page

            rows = base_query.offset((page - 1) * per_page).limit(per_page).all()

            result = [
                {
                    "creator_id": u.user_id,
                    "name": u.username,
                    "email": u.email,
                    "profile_image": u.profile_image,
                    "campaigns": int(campaign_count),
                    "total_raised": float(total_raised),
                    "join_date": u.created_at.strftime("%b %d, %Y") if u.created_at else None,
                }
                for u, campaign_count, total_raised in rows
            ]

            return {
                "status": "success",
                "page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages,
                "data": result,
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500

@campaigns_ns.route('/get-donors')
class UsersData(Resource):
    def get(self):
        """Fetch all donor statistics with pagination (no N+1 queries)"""
        try:
            page = int(request.args.get("page", 1))
            per_page = min(int(request.args.get("per_page", 10)), 100)

            # Single aggregated subquery for donation stats per donor
            donation_stats = (
                db.session.query(
                    Donations.user_id,
                    func.coalesce(func.sum(Donations.amount), 0).label("total_donations"),
                    func.count(func.distinct(Donations.campaign_id)).label("campaigns_supported"),
                )
                .group_by(Donations.user_id)
                .subquery()
            )

            base_query = (
                db.session.query(
                    Users,
                    func.coalesce(donation_stats.c.total_donations, 0).label("total_donations"),
                    func.coalesce(donation_stats.c.campaigns_supported, 0).label("campaigns_supported"),
                )
                .outerjoin(donation_stats, Users.user_id == donation_stats.c.user_id)
                .filter(Users.role == UserRole.donor)
            )

            total_items = base_query.count()
            total_pages = (total_items + per_page - 1) // per_page

            rows = base_query.offset((page - 1) * per_page).limit(per_page).all()

            result = [
                {
                    "user_id": u.user_id,
                    "name": u.username,
                    "email": u.email,
                    "profile_image": u.profile_image,
                    "total_donations": float(total_donations),
                    "campaigns_supported": int(campaigns_supported),
                    "join_date": u.created_at.strftime("%b %d, %Y") if u.created_at else None,
                }
                for u, total_donations, campaigns_supported in rows
            ]

            return {
                "status": "success",
                "page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages,
                "data": result,
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500



@campaigns_ns.route('/highest-funded')
class HighestFunded(Resource):
    @cache.cached(timeout=300, key_prefix='highest_funded')
    def get(self):
        """Fetch top 5 highest funded campaigns with donor count (single query, cached 5 min)"""
        try:
            rows = (
                db.session.query(
                    Campaigns,
                    func.count(func.distinct(Donations.user_id)).label("donor_count"),
                )
                .outerjoin(Donations, Campaigns.campaign_id == Donations.campaign_id)
                .group_by(Campaigns.campaign_id)
                .order_by(Campaigns.raised_amount.desc())
                .limit(5)
                .all()
            )

            result = [
                {
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
                for c, donor_count in rows
            ]

            return {"status": "success", "data": result}, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500

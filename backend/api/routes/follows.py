from flask_restx import Resource
from api.models.cf_models import (
    Follows
)
from flask import jsonify, request
from api import db, follows_ns
from api.models.cf_models import Campaigns, Users,Donations
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from datetime import datetime
from ..helpers import follow_helper

from flask_restx import Resource
from api import follows_ns, db
from api.models.cf_models import Follows
from sqlalchemy.exc import IntegrityError

@follows_ns.route('/toggle-follow/<int:user_id>/<int:campaign_id>')
class ToggleFollowCampaign(Resource):
    @follows_ns.doc("Toggle follow/unfollow a campaign")
    def post(self, user_id, campaign_id):
        """Toggle follow/unfollow for a user and campaign"""
        try:
            existing_follow = Follows.query.filter_by(user_id=user_id, campaign_id=campaign_id).first()

            if existing_follow:
                print('Already follow exists')
                db.session.delete(existing_follow)
                db.session.commit()
                return {
                    "success": True,
                    "action": "unfollowed",
                    "user_id": user_id,
                    "campaign_id": campaign_id
                }, 200
            else:
                print('Creating a follow entry')
                follow = Follows(user_id=user_id, campaign_id=campaign_id)
                db.session.add(follow)
                db.session.commit()
                return {
                    "success": True,
                    "action": "followed",
                    "user_id": user_id,
                    "campaign_id": campaign_id
                }, 201

        except IntegrityError:
            db.session.rollback()
            return {
                "success": False,
                "message": "Database integrity error. Could not toggle follow."
            }, 500
        except Exception as e:
            db.session.rollback()
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}"
            }, 500

@follows_ns.route('/get-following/<int:donor_id>')
class FollowingList(Resource):
    def get(self, donor_id):
        """Get list of campaigns followed by a donor"""
        try:
            results = (
                db.session.query(
                    Campaigns.campaign_id,
                    Campaigns.image,
                    Campaigns.category,
                    Campaigns.title,
                    Campaigns.status
                )
                .join(Follows, Follows.campaign_id == Campaigns.campaign_id)
                .filter(Follows.user_id == donor_id)
                .all()
            )

            following_list = [
                {
                    "campaign_id": r.campaign_id,
                    "image": r.image,
                    "category": r.category.value,
                    "title": r.title,
                    "status": r.status.value
                }
                for r in results
            ]

            return {"following": following_list}, 200

        except IntegrityError:
            db.session.rollback()
            return {
                "success": False,
                "message": "Database integrity error. Could not fetch following list."
            }, 500

        except Exception as e:
            db.session.rollback()
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}"
            }, 500

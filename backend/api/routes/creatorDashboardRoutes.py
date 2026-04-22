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
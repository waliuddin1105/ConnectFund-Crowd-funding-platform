from api import payments_ns, db
from flask_restx import Resource
from api.fields.paymentsField import payments_data
from api.helpers.security_helper import jwt_required
from api.models.cf_models import Donations,Campaigns,Payments,Users
from sqlalchemy import func,distinct
from api import db
from flask import request
@payments_ns.route('/transaction-history')
class TransactionHistory(Resource):
    def get(self):
        """Fetch paginated transaction history from Payments table"""
        try:
            page = request.args.get("page", 1, type=int)
            limit = request.args.get("limit", 5, type=int)
            offset = (page - 1) * limit

            base_query = (
                db.session.query(Payments)
                .order_by(Payments.transaction_date.desc())
            )

            total_records = base_query.count()

            payments = base_query.offset(offset).limit(limit).all()

            result = []
            for p in payments:
                if not p.donation:
                    continue

                transaction = {
                    "type": "donation",
                    "user": {
                        "user_id": p.donation.user.user_id,
                        "name": p.donation.user.username,
                        "email": p.donation.user.email,
                        "profile_image": p.donation.user.profile_image
                    } if p.donation.user else None,
                    "campaign": {
                        "campaign_id": p.donation.campaign.campaign_id,
                        "title": p.donation.campaign.title
                    } if p.donation.campaign else None,
                    "amount": float(p.donation.amount),
                    "date_time": p.transaction_date.strftime("%Y-%m-%d %H:%M"),
                    "status": p.payment_status.value
                }
                result.append(transaction)

            return {
                "status": "success",
                "page": page,
                "limit": limit,
                "total_records": total_records,
                "total_pages": (total_records + limit - 1) // limit,
                "data": result
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"status": "error", "message": str(e)}, 500

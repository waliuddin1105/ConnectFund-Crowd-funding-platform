from api import admin_reviews_ns
from flask_restx import fields

admin_reviews_data = admin_reviews_ns.model (
    "Admin Reviews Data",
    {
        "admin_id" : fields.Integer(required=True, description="ID of the admin(user) who made the review"),
        "campaign_id" : fields.Integer(required = True, description="ID of the campaign being reviewed"),
        "decision" : fields.String(required=True, description="Decision made by the admin (e.g., approved, rejected)"),
        "comments" : fields.String(required=False, description="Optional comments provided by the admin during the review"),
        "created_at" : fields.DateTime(required=False, description="Timestamp when the review was created")
    }
)

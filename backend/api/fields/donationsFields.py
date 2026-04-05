from api import donations_ns
from flask_restx import fields

donations_data = donations_ns.model (
    "Donations Data",
    {
        "user_id" : fields.Integer(required = True, description = "Enter a valid user ID"),
        "campaign_id" : fields.Integer(required = True, description = "Enter a valid campaign ID"),
        "amount" : fields.Float(required = True, description = "Enter donation amount"),
        "created_at" : fields.DateTime(required = False, description = "Donation creation timestamp"),
        "status" : fields.String(required = True, description = "Enter donation status e.g 'pending', 'completed', 'refunded', 'cancelled'"),
    }
)
from api import campaigns_ns
from flask_restx import fields

campaigns_data = campaigns_ns.model  (
    "Campaigns Data",
    {
        "creator_id" : fields.Integer(required = True, description = "Enter a valid creator user ID"),
        "title" : fields.String(required = True, description = "Enter campaign title"),
        "description" : fields.String(required = True, description = "Enter campaign description"),
        "category" : fields.String(required = True, description = "Enter campaign category"),
        "goal_amount" : fields.Float(required = True, description = "Enter goal amount"),
        "raised_amount" : fields.Float(required = False, description = "Amount raised so far, defaults to 0"),
        "image_url" : fields.String(required = True, description = "URL of the campaign image"),
        "status" : fields.String(required = False, description = "Campaign status (e.g. 'active', 'completed', 'pending', 'rejected)"),
        "created_at" : fields.DateTime(required = False, description = "Campaign creation timestamp"),
        "updated_at" : fields.DateTime(required = False, description = "Last campaign update timestamp")
    }
)

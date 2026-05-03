from api import campaign_updates_ns
from flask_restx import fields

campaign_updates_data = campaign_updates_ns.model  (
    "Campaign Updates Data",
    {
        "campaign_id" : fields.Integer(required=True, description="ID of the campaign associated with the update"),
        "content" : fields.String(required = True, description="Content of the campaign update"),
        "created_at" : fields.DateTime(required=False, description="Timestamp when the update was created")
    }
)
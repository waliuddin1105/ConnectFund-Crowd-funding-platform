from api import follows_ns
from flask_restx import fields

follows_data = follows_ns.model (
    "Follows Data",
    {
        "user_id" : fields.Integer(required=True, description="ID of the user who is being followed"),
        "camapign_id" : fields.Integer(required = True, description="ID of the campaign being followed"),
        "created_at" : fields.DateTime(required=False, description="Timestamp when the follow action was created")
    }
)
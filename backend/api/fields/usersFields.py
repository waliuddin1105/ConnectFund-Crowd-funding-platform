from api import users_ns
from flask_restx import fields

users_data = users_ns.model (
    "Users Data",
    {
        "username" : fields.String(required = True, description = "Enter a unique username"),
        "email" : fields.String(required = True, description = "Enter email"),
        "password" : fields.String(required = True, description = "Enter a strong password"),
        "role" : fields.String(required = True, description = "Enter role e.g 'donor', 'creator', 'admin'"),
        "profile_image" : fields.String(required = False, description = "Enter profile image URL"),
        "created_at" : fields.DateTime(required = False, description = "Account creation timestamp"),
        "updated_at" : fields.DateTime(required = False, description = "Last account update timestamp")
    }
)

users_update_data = users_ns.model(
    "Users update data",
    {
        "username" : fields.String(required = False, default = None),
        "password" : fields.String(required = False, default = None),
        "role" : fields.String(required = False, default = None),
        "profile_image" : fields.String(required = False, default = None)
    }
)
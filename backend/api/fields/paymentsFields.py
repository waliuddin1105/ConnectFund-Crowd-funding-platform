from api import payments_ns
from flask_restx import fields

payments_data = payments_ns.model (
    "Payments Data",
    {
        "donator_id" : fields.Integer(required = True, description = "Enter a valid donor user ID"),
        "amount" : fields.Float(required = True, description = "Enter payment amount"),
        "payment_method" : fields.String(required = True, description = "Enter payment method"),
        "payment_status" : fields.String(required = True, description = "Enter payment status"),
        "transaction_date" : fields.DateTime(required = True, description = "Enter transaction date")
    }
)
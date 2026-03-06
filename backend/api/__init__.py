from flask import Flask
from flask_restx import Api, Namespace
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate


authorizations = {
    'bearer authorizations':
    {
        'type' : 'apiKey',
        'in' : 'header',
        'name' : 'Authorization',
        'description' : '*Bearer* <type your bearer token here>'
    }
}

app = Flask(__name__)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

api = Api(
    app,
    version='1.0',
    title="Crowdfunding platform",
    description="Api for crowdfunding platform",
    authorizations=authorizations,
    security='bearer authorizations' 
)

users_ns = Namespace('Users', description='Data about the users')
campaigns_ns = Namespace('Campaigns', description="Data about the campaigns")
donations_ns = Namespace('Donations', description='Data about the donations')
comments_ns = Namespace('Comments', description="Data about the comments")
payments_ns = Namespace('Payments', description='Data about the payments')
updates_ns = Namespace('Updates', description="Data about the updates")
donations_ns = Namespace('Donations', description='Data about the donations')
follows_ns = Namespace('Follows', description = 'Data about user follows')
campaign_updates_ns = Namespace('Campaign Updates', description="Data about the campaign updates")
admin_reviews_ns = Namespace('Admin Reviews', description = 'Data about admin reviews')
creator_ns = Namespace('Creator', description= "Creator dashboard")

api.add_namespace(users_ns, '/users')
api.add_namespace(campaigns_ns, '/campaigns')
api.add_namespace(donations_ns, '/donations')
api.add_namespace(comments_ns, '/comments')
api.add_namespace(payments_ns, '/payments')
api.add_namespace(updates_ns, '/updates')
api.add_namespace(donations_ns, '/donations')
api.add_namespace(follows_ns, '/follows')
api.add_namespace(campaign_updates_ns, '/campaign-updates')
api.add_namespace(admin_reviews_ns,'/admin-reviews')
api.add_namespace(creator_ns,'/creator')

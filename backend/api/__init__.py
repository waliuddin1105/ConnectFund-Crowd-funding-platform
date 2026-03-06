from flask import Flask
from flask_restx import Api, Namespace
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate


app = Flask(__name__)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

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


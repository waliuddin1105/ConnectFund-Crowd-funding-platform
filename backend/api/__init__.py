from flask import Flask
from flask_restx import Api, Namespace
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_compress import Compress


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

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:14Nov%402005@localhost:5432/crowdfunding_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Response compression (gzip / brotli)
app.config["COMPRESS_REGISTER"] = True
app.config["COMPRESS_MIMETYPES"] = [
    "application/json",
    "text/html",
    "text/css",
    "application/javascript",
]
app.config["COMPRESS_MIN_SIZE"] = 500

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

compress = Compress(app)

# Caching — SimpleCache by default; swap CACHE_TYPE/CACHE_REDIS_URL for Redis
from api.helpers.cache_helper import init_cache
init_cache(app)

# Rate limiter
from api.helpers.limiter import init_limiter
init_limiter(app)

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

from datetime import datetime
from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from api import bcrypt
from api import db, app

user_comment_likes = db.Table(
    "user_comment_likes",
    db.Column("user_id", db.Integer, db.ForeignKey("users.user_id"), primary_key=True),
    db.Column("comment_id", db.Integer, db.ForeignKey("comments.comment_id"), primary_key=True),
)


class DonationStatus(Enum):
    pending = "pending"
    completed = "completed"
    refunded = "refunded"
    cancelled = "cancelled"


class UserRole(Enum):
    donor = "donor"
    creator = "creator"
    admin = "admin"


class CampaignStatus(Enum):
    active = "active"
    completed = "completed"
    pending = "pending"
    rejected = "rejected"


class CampaignCategory(Enum):
    education = "education"
    personal = "personal"
    emergency = "emergency"
    charity = "charity"
    medical = "medical"


class CampaignPaymentStatus(Enum):
    pending = "pending"
    successful = "successful"
    failed = "failed"
    refunded = "refunded"


class Users(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    profile_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # FIXED: Added the missing relationship for liked comments
    liked_comments = db.relationship(
        "Comments",
        secondary=user_comment_likes,
        back_populates="liked_by_users",
        lazy="dynamic"
    )

    def setPasswordHash(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def checkHashedPassword(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {    
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value if self.role else None,
            "profile_image": self.profile_image
        }

    liked_comments = db.relationship(
    "Comments", secondary=user_comment_likes, back_populates="liked_by_users"
    )
    liked_comments = db.relationship(
    "Comments", secondary=user_comment_likes, back_populates="liked_by_users"
    )

class Campaigns(db.Model):
    __tablename__ = "campaigns"

    campaign_id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.Enum(CampaignCategory), nullable=False)
    goal_amount = db.Column(db.Numeric(10, 2), nullable=False)
    raised_amount = db.Column(db.Numeric(10, 2), default=0)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    image = db.Column(db.String(512),nullable=False)
    status = db.Column(db.Enum(CampaignStatus), default=CampaignStatus.pending)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    creator = db.relationship(
        "Users",
        backref=db.backref("campaigns", lazy=True, cascade="all, delete-orphan"),
    )

    comments = db.relationship(
        "Comments", backref="campaign", lazy=True, cascade="all, delete-orphan"
    )
    donations = db.relationship(
        "Donations", backref="campaign", lazy=True, cascade="all, delete-orphan"
    )
    follows = db.relationship(
        "Follows", backref="campaign", lazy=True, cascade="all, delete-orphan"
    )
    updates = db.relationship(
        "CampaignUpdates", backref="campaign", lazy=True, cascade="all, delete-orphan"
    )
    reviews = db.relationship(
        "AdminReviews", backref="campaign", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "campaign_id": self.campaign_id,
            "title": self.title,
            "description": self.description,
            "category": self.category.value,
            "goal_amount": float(self.goal_amount),
            "raised_amount": float(self.raised_amount),
            "image": self.image,
            "status": self.status.value,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "creator": (
                {
                    "user_id": self.creator.user_id,
                    "username": self.creator.username,
                    "profile_image": self.creator.profile_image,
                }
                if self.creator
                else None
            ),
        }


class Comments(db.Model):
    __tablename__ = "comments"
    
    
    comment_id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaigns.campaign_id"), nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

    user = db.relationship(
        "Users", backref=db.backref("comments", lazy=True, cascade="all, delete-orphan")
    )

    liked_by_users = db.relationship(
        "Users",
        secondary=user_comment_likes,
        back_populates="liked_comments",
        lazy="dynamic"
    )

    def to_dict(self):
        return {
            "comment_id": self.comment_id,
            "content": self.content,
            "likes": self.likes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": (
                {
                    "user_id": self.user.user_id,
                    "username": self.user.username,
                    "profile_image": self.user.profile_image,
                }
                if self.user
                else None
            ),
            "campaign": (
                {"campaign_id": self.campaign.campaign_id, "title": self.campaign.title}
                if self.campaign
                else None
            ),
        }


class Payments(db.Model):
    __tablename__ = "payments"

    payment_id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(
        db.Integer, db.ForeignKey("donations.donation_id"), nullable=False
    )
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.Enum(CampaignPaymentStatus), nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    donation = db.relationship(
        "Donations",
        backref=db.backref("payments", lazy=True, cascade="all, delete-orphan"),
    )

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "payment_method": self.payment_method,
            "payment_status": self.payment_status.value,
            "transaction_date": self.transaction_date,
            "donation": (
                {
                    "donation_id": self.donation.donation_id,
                    "amount": float(self.donation.amount),
                }
                if self.donation
                else None
            ),
        }


class Donations(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaigns.campaign_id"), nullable=False
    )
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum(DonationStatus), default=DonationStatus.pending)
    user = db.relationship(
        "Users",
        backref=db.backref("donations", lazy=True, cascade="all, delete-orphan"),
    )

    def to_dict(self):
        return {
            "donation_id": self.donation_id,
            "amount": float(self.amount),
            "created_at": self.created_at.isoformat(),
            "status": self.status.value,
            "user": (
                {
                    "user_id": self.user.user_id,
                    "username": self.user.username,
                    "profile_image": self.user.profile_image,
                }
                if self.user
                else None
            ),
            "campaign": (
                {"campaign_id": self.campaign.campaign_id, "title": self.campaign.title}
                if self.campaign
                else None
            ),
        }


class Follows(db.Model):
    __tablename__ = "follows"

    follow_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaigns.campaign_id"), nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship(
        "Users", backref=db.backref("follows", lazy=True, cascade="all, delete-orphan")
    )

    def to_dict(self):
        return {
            "follow_id": self.follow_id,
            "created_at": self.created_at,
            "user": (
                {
                    "user_id": self.user.user_id,
                    "username": self.user.username,
                    "profile_image": self.user.profile_image,
                }
                if self.user
                else None
            ),
            "campaign": (
                {"campaign_id": self.campaign.campaign_id, "title": self.campaign.title}
                if self.campaign
                else None
            ),
        }


class CampaignUpdates(db.Model):
    __tablename__ = "campaign_updates"

    update_id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaigns.campaign_id"), nullable=False
    )
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "update_id": self.update_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "campaign": (
                {"campaign_id": self.campaign.campaign_id, "title": self.campaign.title}
                if self.campaign
                else None
            ),
        }


class AdminReviews(db.Model):
    __tablename__ = "admin_reviews"

    review_id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaigns.campaign_id"), nullable=False
    )
    decision = db.Column(db.String(20), nullable=False)
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    admin = db.relationship(
        "Users",
        backref=db.backref("admin_reviews", lazy=True, cascade="all, delete-orphan"),
    )

    def to_dict(self):
        return {
            "review_id": self.review_id,
            "decision": self.decision,
            "comments": self.comments,
            "created_at": self.created_at.isoformat(),
            "admin": (
                {"user_id": self.admin.user_id, "username": self.admin.username}
                if self.admin
                else None
            ),
            "campaign": (
                {"campaign_id": self.campaign.campaign_id, "title": self.campaign.title}
                if self.campaign
                else None
            ),
        }

    
with app.app_context():
    db.create_all()

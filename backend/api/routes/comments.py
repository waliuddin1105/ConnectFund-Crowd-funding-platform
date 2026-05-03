from flask_restx import Resource
from flask import  request
from api import db, comments_ns
from api.models.cf_models import Campaigns, Users,Comments
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from datetime import datetime
from api.helpers.security_helper import jwt_required

@comments_ns.route('/post-comment/<int:user_id>/<int:campaign_id>')
class CommentDetails(Resource):
    @jwt_required
    def post(self, user_id, campaign_id):
        try:
            data = request.get_json()
            message = data.get("message")

            if not message or not message.strip():
                return {"success": False, "error": "Comment message is required."}, 400

            sql = text("""
                SELECT * FROM post_comment(:u, :c, :m)
            """)

            result = db.session.execute(sql, {
                "u": user_id,
                "c": campaign_id,
                "m": message.strip()
            })

            new_comment = result.fetchone()

            db.session.commit()

            if not new_comment:
                return {"success": False, "error": "Failed to insert comment."}, 500

            comment_dict = {
                "comment_id": new_comment.comment_id,
                "user_id": new_comment.user_id,
                "campaign_id": new_comment.campaign_id,
                "content": new_comment.content,
                "created_at": new_comment.created_at.isoformat(),
                "likes": new_comment.likes 
            }

            return {
                "success": True,
                "comment": comment_dict
            }, 201

        except Exception as e:
            import traceback
            print("ERROR:", e)
            traceback.print_exc()
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500


@comments_ns.route('/get-comments/<int:campaign_id>')
class GetComments(Resource):
    def get(self, campaign_id):
        try:
            sql = text("""
                SELECT *
                FROM comments_view
                WHERE campaign_id = :c
                ORDER BY created_at DESC
            """)

            result = db.session.execute(sql, {"c": campaign_id}).fetchall()

            comments = [
                {
                    "comment_id": c.comment_id,
                    "username": c.username,
                    "user_id": c.user_id,
                    "profile_image": c.profile_image,
                    "likes": c.likes,
                    "content": c.content,
                    "created_at": c.created_at.isoformat() if c.created_at else None
                }
                for c in result
            ]

            return {"success": True, "comments": comments}, 200

        except Exception as e:
            db.session.rollback()
            return {"success": False, "error": str(e)}, 500



@comments_ns.route('/toggle-like/<int:user_id>/<int:comment_id>')
class ToggleLike(Resource):
    def post(self, user_id, comment_id):
        try:
            user = Users.query.get_or_404(user_id)
            comment = Comments.query.get_or_404(comment_id)

            if comment in user.liked_comments:
                user.liked_comments.remove(comment)
                comment.likes = max((comment.likes or 1) - 1, 0)
                db.session.commit()
                return {
                    "success": True,
                    "message": "Comment unliked successfully.",
                    "liked": False,
                    "likes": comment.likes
                }, 200
            else:
                user.liked_comments.append(comment)
                comment.likes = (comment.likes or 0) + 1
                db.session.commit()
                return {
                    "success": True,
                    "message": "Comment liked successfully.",
                    "liked": True,
                    "likes": comment.likes
                }, 200

        except Exception as e:
            db.session.rollback()
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}, 500

import jwt
import datetime
from functools import wraps
from flask import current_app, request, jsonify


def generate_jwt(user_id, username, role):
    """Generate a JWT token for a user_id, username, and role with 1 hour expiry."""
    try:
        payload = {
            "user_id": user_id,
            "username": username,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            "iat": datetime.datetime.utcnow(),
        }
        token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
        return token
    except Exception as e:
        raise RuntimeError(f"Failed to generate JWT: {str(e)}")


def verify_jwt(token):
    """Verify and decode a JWT token; return the payload if valid.
    Raises ValueError on invalid or expired token.
    """
    try:
        payload = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired. Please log in again")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


from flask import g

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"status": "error", "message": "Authorization header missing"}, 401

        token = auth_header.split(" ")[1]

        try:
            payload = verify_jwt(token)
            g.user_id = payload["user_id"]  # store in flask.g
            return f(*args, **kwargs)
        except ValueError as e:
            return {"status": "error", "message": str(e)}, 401

    return decorated_function



def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        """Decorator to enforce admin role; checks flask_login then JWT.
        Returns 401/403 if authorization fails.
        """
        try:
            from flask_login import current_user

            if (
                getattr(current_user, "is_authenticated", False)
                and str(getattr(current_user, "role", "")).lower() == "admin"
            ):
                return f(*args, **kwargs)
        except Exception:
            pass

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return (
                jsonify({"status": "error", "message": "Authorization header missing"}),
                401,
            )

        token = auth_header.split(" ")[1]

        try:
            payload = verify_jwt(token)
            if payload.get("role") != "admin":
                return jsonify({"status": "error", "message": "Admins only"}), 403
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 401

    return decorated_function


def creator_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        """Decorator to enforce creator role; checks flask_login then JWT.
        Returns 401/403 if authorization fails.
        """
        try:
            from flask_login import current_user

            if (
                getattr(current_user, "is_authenticated", False)
                and str(getattr(current_user, "role", "")).lower() == "creator"
            ):
                return f(*args, **kwargs)
        except Exception:
            pass

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return (
                jsonify({"status": "error", "message": "Authorization header missing"}),
                401,
            )

        token = auth_header.split(" ")[1]

        try:
            payload = verify_jwt(token)
            if payload.get("role") != "creator":
                return jsonify({"status": "error", "message": "Creators only"}), 403
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 401

    return decorated_function

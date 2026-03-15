from api import db, bcrypt
from api.models.cf_models import Users, UserRole
from datetime import datetime
from sqlalchemy.exc import IntegrityError


def create_user(username, password, email, role=None, profile_image=None):
    """Create a new user and return the user as a dict.
    Accepts role as enum or string; hashes the password.
    """
    user_args = {"username": username, "email": email, "profile_image": profile_image}

    if role:
        user_args["role"] = role if isinstance(role, UserRole) else UserRole(role)

    user = Users(**user_args)
    user.setPasswordHash(password)

    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("User with username or email already exists")
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not create a new user: {str(e)}")

    return user.to_dict()


def change_password(user_id, new_password):
    """Change a user's password by their user_id and return a confirmation.
    Hashes the provided password before saving.
    """
    user = Users.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    user.setPasswordHash(new_password)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not change the password: {str(e)}")

    return {"message": "Password updated successfully", "user_id": user.user_id}


def search_users(keyword):
    """Search for users by username or email substring and return matches.
    Returns a list of user dicts.
    """
    try:    
            matched_users = Users.query.filter(Users.username.ilike(f"%{keyword}%")).all()

            if not matched_users:
                return {"Error" : "No matching results for your search"}, 404
            
            display_users = [
                user.to_dict() for user in matched_users
            ]

            return {
                "Success" : "Search succesful!",
                "users" : display_users
            }, 200
    except Exception as e:
        return {"Error" : f"Unexpected Error {str(e)}"}, 500


def update_user(user_id, **kwargs):
    """Update allowed user fields (email, username, role, profile_image).
    Returns the updated user as a dict.
    """
    user = Users.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    allowed_fields = ["email", "username", "role", "profile_image"]
    for field, value in kwargs.items():
        if field in allowed_fields:
            if field == "role":
                user.role = value if isinstance(value, UserRole) else UserRole(value)
            else:
                setattr(user, field, value)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("User with email or username already exists")
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not update the user: {str(e)}")

    return user.to_dict()


def checkLoginCredentials(identifier, password):
    """Validate login credentials and return the user dict on success.
    Raises ValueError for invalid credentials.
    """
    user = Users.query.filter(
        (Users.username == identifier) | (Users.email == identifier)
    ).first()

    if not user:
        raise ValueError("Incorrect username/email or password")

    if not user.checkHashedPassword(password):
        raise ValueError("Incorrect username/email or password")

    return user.to_dict()


def get_all_users():
    """Return all users as a list of dictionaries.
    Useful for admin listings.
    """
    users = Users.query.all()
    return [u.to_dict() for u in users]


def get_user_by_username(username):
    """Fetch a user by username and return as dict. Raises if not found.
    """
    user = Users.query.filter_by(username=username).first()
    if not user:
        raise ValueError(f"User with username '{username}' not found")
    return user.to_dict()


def get_user_by_email(email):
    """Fetch a user by email and return as dict. Raises if not found.
    """
    user = Users.query.filter_by(email=email).first()
    if not user:
        raise ValueError(f"User with email '{email}' not found")
    return user.to_dict()


def view_user(user_id):
    """Return a user's dict by user_id. Raises if not found.
    """
    user = Users.query.get(user_id)
    if not user:
        raise ValueError("User not found")
    return user.to_dict()


def delete_user(user_id):
    """Delete a user by id and return a confirmation message.
    Raises ValueError if the user does not exist.
    """
    user = Users.query.get(user_id)

    if not user:
        raise ValueError("No user found")

    try:
        db.session.delete(user)
        db.session.commit()
        return {"message": f"Deleted user with id {user_id}"}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not delete user with id {user_id}: {str(e)}")


def delete_all_users():
    """Delete all users from the database (use with caution).
    Returns the number of deleted rows in a message.
    """
    try:
        deleted = db.session.query(Users).delete()
        db.session.commit()
        return {"message": f"Successfully deleted {deleted} users"}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Could not delete all users: {str(e)}")

from api import users_ns, db, bcrypt
from flask import request
from flask_restx import Resource
from api.fields.usersFields import users_data, users_update_data
from api.models.cf_models import Users
from api.helpers.security_helper import generate_jwt, jwt_required
from api.helpers.user_helper import search_users

#/users/login
@users_ns.route('/login')
class LoginUser(Resource):
    @users_ns.doc('Login a user')
    @users_ns.expect(users_data)
    def post(self):
        try:
            data = request.json

            if not data['password'] or not data['email']:
                return {"Error" : "Email or password missing"}, 400
            
            attempted_user = Users.query.filter_by(email = data['email']).first()
            
            if not attempted_user or not attempted_user.checkHashedPassword(data['password']):
                return {"Error" : "Incorrect email or password"}, 401
            
            access_token = generate_jwt(attempted_user.user_id, attempted_user.username, attempted_user.role.value,)

            return {
                "Success" : "User login succesful!",
                "access_token" : access_token,
                "user" :  attempted_user.to_dict()
            }, 200
         
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500
        
#/users/logout
@users_ns.route('/logout')
class UserLogout(Resource):
    @jwt_required
    @users_ns.doc('User logout')
    def post(self):
        return {"Sucess" : "User succesfully logged out"}, 200


#/users/register
@users_ns.route('/register')
class RegisterUser(Resource):
    @users_ns.doc('Register a user')
    @users_ns.expect(users_data)
    def post(self):
        try:
            data = request.json

            if not data['username']:
                return {"Error" : "Please enter a username"}, 400
            if not data['email']:
                return {"Error" : "Please enter a valid email address"}, 400
            if not data['password']:
                return {"Error" : "Please enter a valid password"}, 400
            role = data.get('role')
            if not role or role.lower() not in ['donor', 'creator', 'admin']:
                return {"Error" : "Please select a valid user role"}, 400
            
            if Users.query.filter_by(username = data['username']).first():
                return {"Error" : "Username already exists! Please choose a unique username"}, 400
            if Users.query.filter_by(email = data ['email']).first():
                return {"Error" : "An existing account is already associated with the provided email"}, 400

            new_user = Users(username = data['username'], email = data['email'], role = data['role'])
            new_user.setPasswordHash(data['password'])
            new_user.profile_image = data.get('profile_image', None)

            db.session.add(new_user)
            db.session.commit()

            return {
                "Success" : "User registered succesfully!",
                "user_id" : new_user.to_dict()
            }, 200
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500
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

#users/profile  -> get user profile, mainly for testing
@users_ns.route('/profile')
class GetUserProfile(Resource):
    @users_ns.doc("Get user profile")
    @users_ns.param('user_id')
    @jwt_required
    def get(self):
        try:
            user_id = request.args.get("user_id")

            if not user_id:
                return {"Error" : "user_id missing"}, 400
            
            attempted_user = Users.query.filter_by(user_id = user_id).first()

            if not attempted_user:
                return {"Error" : "User does not exist!"}, 404
            
            return {
                "Success" : True,
                "user" :  attempted_user.to_dict()  
            }, 200
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500

#users/update-profile
@users_ns.route('/update-profile')
class UpdateUserProfile(Resource):
    @jwt_required
    @users_ns.doc("Update user profile")
    @users_ns.expect(users_update_data)
    def put(self):
        from flask import g
        try:
            user_to_update = Users.query.get(g.user_id)

            if not user_to_update:
                return {"Error" : "Such user does not exist"}, 404
        
            data = request.json
            new_username = data.get('username')
            new_password = data.get('password')
            new_role = data.get('role')
            new_profile_image = data.get('profile_image', user_to_update.profile_image)

            if new_username == 'string' or not new_username:
                new_username = user_to_update.username
            if Users.query.filter(Users.username == new_username, Users.user_id != g.user_id).first(): 
                return {"Error" : "Username already exists! Please choose a unique username"}, 400
            
            if not new_role or new_role == "string":
                new_role = user_to_update.role.value
            new_role = new_role.lower()
            if new_role not in ['donor', 'creator', 'admin']:
                return {"Error" : "Please select a valid user role"}, 400
            
            if new_password and new_password != "string":
                user_to_update.setPasswordHash(new_password)

            if new_profile_image == "string":
                new_profile_image = user_to_update.profile_image

            user_to_update.username = new_username
            user_to_update.role = new_role
            user_to_update.profile_image = new_profile_image
            user_to_update.updated_at = db.func.current_timestamp()
            
            db.session.commit()

            return {
                "Success" : f"User profile with id {user_to_update.user_id} updated succesfully",
                "user" : user_to_update.to_dict()
                
            }, 200
        
        except Exception as e:
            return {"Error": f"Unexpected Error {str(e)}"}, 500
       
@users_ns.route('/search-user')
class SearchByUsername(Resource):
    @jwt_required
    @users_ns.doc('Search by username')
    @users_ns.param('username')
    def get(self):
        try:
            keyword = request.args.get("username")
            if not keyword:
                return {"Error" : "Please enter a username to search"}, 400
            
            return search_users(keyword)
        
        except Exception as e:
            return {"Error" : f"Unexpected Error {str(e)}"}, 500
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
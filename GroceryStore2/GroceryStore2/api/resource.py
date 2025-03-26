from flask_restful import Api, Resource,abort,fields,marshal
from models import db, User as users_model
from flask_security import auth_required

api = Api(prefix="/api")


user_resource_fields={'username':fields.String,
                      'email':fields.String}


# user= {
#     "username":"vshnu",
#     "email":"vishnuchenga@gmail.com"
# }


class User(Resource):

    @auth_required('token')
    def get(self,id=None):
        if id == 5:
            abort(400, message ='This user is restricted')
        else:
            user = users_model.query.filter_by(id=id).first()
            if  user :
                return marshal(user,user_resource_fields)
            else:
                abort(404, message="user not found")
    


api.add_resource(User ,"/users/<int:id>")
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin,RoleMixin
import uuid
from datetime import datetime

db=SQLAlchemy()

roles_users = db.Table('roles_users',db.Column('user_id',db.Integer(),db.ForeignKey('user.id')),
                                    db.Column('role_id',db.Integer(),db.ForeignKey('role.id')))


class User(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True , nullable=False)
    approved = db.Column(db.Boolean, default=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('user', lazy='dynamic')) 
    
    def __init__(self, email, password,username,active,roles,approved,fs_uniquifier):
        self.username=username
        self.email = email
        self.active=active
        self.roles=roles
        self.password = password
        self.approved=approved
        self.fs_uniquifier = generate_random_uniquifier()

def generate_random_uniquifier():
    # Generate a unique value using UUID
    uniquifier = str(uuid.uuid4())
    return uniquifier

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    

class Categories(db.Model):
    __tablename__ = 'Categories'
    C_ID = db.Column(db.Integer,autoincrement=True, primary_key=True, unique=True, nullable=False)
    C_name = db.Column(db.String, nullable=False , unique=True)
    products = db.relationship("Products",back_populates="category",cascade='all, delete-orphan', lazy="subquery")
    
class Products(db.Model):
    __tablename__ = 'Products'
    P_ID = db.Column(db.Integer,autoincrement=True, primary_key=True, unique=True, nullable=False)
    C_ID = db.Column(db.Integer, db.ForeignKey("Categories.C_ID",ondelete='CASCADE') ,nullable=False )
    P_name = db.Column(db.String , nullable=False)
    unit = db.Column(db.String )
    price_per_unit = db.Column(db.Integer , nullable=False)
    manf_exp_Date = db.Column(db.String , nullable=True)
    umo_id = db.Column(db.Integer , db.ForeignKey("uom.uom_id",ondelete='CASCADE'),nullable=False)
    avable_qunty = db.Column(db.Integer)
    remaining_quantity = db.Column(db.Integer, nullable=False)
    category = db.relationship("Categories", back_populates="products")
    

class Orders(db.Model):
    __tablename__ = 'Orders'
    orderID = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)



class OrderDetails(db.Model):
    __tablename__ = 'OrderDetails'
    detailID = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    orderID = db.Column(db.Integer, db.ForeignKey('Orders.orderID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Add this field for user ID
    productID = db.Column(db.Integer, db.ForeignKey('Products.P_ID'), nullable=False)
    product_name = db.Column(db.String, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    grand_total = db.Column(db.Float, nullable=False)



class uom(db.Model):
    __tablename__ = 'uom'
    uom_id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    uom_name = db.Column(db.String, nullable=False)


class EditRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer)
    current_category_name = db.Column(db.String)
    new_category_name = db.Column(db.String)
 


    
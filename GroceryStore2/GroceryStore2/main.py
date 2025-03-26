from flask import Flask,render_template,jsonify,request, current_app,Response,send_file,render_template_string
from api.resource import api,User
from models import db, User ,Role,Categories,Products,uom,EditRequest,Orders,OrderDetails
from security import user_datastore,security
from flask_security import hash_password,roles_accepted
from sqlalchemy import or_
from flask_login import login_user , current_user
from celery_worker import make_celery
from celery.result import AsyncResult
from celery.schedules import crontab,timedelta
from json import dumps
from httplib2 import Http
from datetime import datetime, timedelta
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from time import perf_counter_ns
from jinja2 import Template
from flask_caching import Cache
import redis

print(redis.__version__)

app =Flask (__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.config["SECRET_KEY"] = "MAD2"
app.config["SECURITY_PASSWORD_SALT"] = "salt"
app.config['WTF_CSRF_ENABLED'] = False
app.config["SECURITY_TOKEN_AUTHENTICATION_HEADER"] = "Authentication-Token"
app.config["SECURITY_PASSWORD_HASH"] = "bcrypt"


cache = Cache(app, config={'CACHE_TYPE': 'simple'})
app.config['CACHE_DEFAULT_TIMEOUT'] = 300


api.init_app(app)
db.init_app(app)
security.init_app(app,user_datastore) 

app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)
celery = make_celery(app)



@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls send_reminder() every day 5 pm  crontab(hour=17),
    sender.add_periodic_task(timedelta(minutes=2), send_reminder.s(), name='daily reminder',)
    
    # Calls monthly_activity_report() on the first day of the month   crontab(hour=10, minute=00, day_of_month=1),
    sender.add_periodic_task(timedelta(seconds=30), monthly_activity_report.s(), name='email activity report',)





@celery.task()
def monthly_activity_report():
    # Query normal users (assuming 'id=3' represents normal users)
    normal_users = User.query.filter(User.roles.any(id=3)).all()

    # Get the current month and year
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year

    monthly_activity_report = []
    for user in normal_users:
        # Fetch user's orders for the specified month
        user_orders = (
            db.session.query(Orders)
            .join(OrderDetails, Orders.orderID == OrderDetails.orderID)
            .filter(
                Orders.userID == user.id,
                db.extract('month', Orders.order_date) == current_month,
                db.extract('year', Orders.order_date) == current_year,
            )
            .all()
        )
        user_orders_list = []

        for order in user_orders:
            # Fetch order details for each order
            order_details = OrderDetails.query.filter_by(orderID=order.orderID).all()

            # Calculate grand total for the order
            grand_total = sum(detail.total_price for detail in order_details)

            # Prepare a list to store order details for the current order
            order_details_list = []

            for detail in order_details:
                order_details_list.append({
                    'productID': detail.productID,
                    'product_name': detail.product_name,
                    'price_per_unit': detail.price_per_unit,
                    'quantity': detail.quantity,
                    'total_price': detail.total_price
                })

            # Add order information along with details to the user's order list
            user_orders_list.append({
                'orderID': order.orderID,
                'order_date': order.order_date,
                'order_details': order_details_list,
                'grand_total': grand_total
            })

        # Add user information along with orders to the main list
        monthly_activity_report.append({
            'user_id': user.id,
            'username': user.username,
            'orders': user_orders_list
        })

        # Prepare the report message using an HTML template
        email_content = render_template_string(
            """
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    h2 {
                        color: #333;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                    }
                    li {
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <h2>Monthly Activity Report - {{ user_data['username'] }}</h2>
                {% for order in user_data['orders'] %}
                    <h3>Order ID: {{ order['orderID'] }}</h3>
                    <p>Order Date: {{ order['order_date'] }}</p>
                    <ul>
                        {% for detail in order['order_details'] %}
                            <li>
                                <strong>Product: </strong>{{ detail['product_name'] }}<br>
                                <strong>Price per Unit: </strong>{{ detail['price_per_unit'] }}<br>
                                <strong>Quantity: </strong>{{ detail['quantity'] }}<br>
                                <strong>Total Price: </strong>{{ detail['total_price'] }}
                            </li>
                        {% endfor %}
                    </ul>
                    <p><strong>Grand Total: </strong>{{ order['grand_total'] }}</p>
                {% endfor %}
            </body>
            </html>
            """,
            user_data=monthly_activity_report[-1],  # Pass the last user_data in the list
            current_month=current_month,
            current_year=current_year,
        )

        # Send email
        send_email(
            to_address=user.email,
            subject="Your Monthly Activity Report",
            message=email_content,
            content="html"
        )

    return "Monthly activity reports sent successfully!"



@celery.task()
def add_together(a, b):
    time.sleep(10)
    return a + b







@celery.task()
def generate_csv():
    # importing the csv module
    import csv
    import time

    # name of csv file
    filename = "Product_data.csv"

    # field names
    fields = ['P_ID', 'C_ID', 'Product Name', 'Price', 'Remaining Quantity', 'No of Units Sold']

    # Fetch data from the Products table
    products = Products.query.all()

    # data rows of csv file
    rows = []

    for product in products:
        # Calculate no of units sold
        units_sold = product.avable_qunty - product.remaining_quantity

        row = [product.P_ID, product.C_ID, product.P_name, product.price_per_unit, product.remaining_quantity, units_sold]
        rows.append(row)

    # writing to csv file
    with open("static/data.csv", "w", newline='') as csvfile:
        # creating a csv writer object
        csvwriter = csv.writer(csvfile)

        # writing the fields
        csvwriter.writerow(fields)

        # writing the data rows
        csvwriter.writerows(rows)

    return "Job started.."



@celery.task
def send_reminder():
    WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAM_E4Qb0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=q0O8a7PIfHMzLxfONVEjNGBMkU_5G68dUvrjXABvBNg"
    
    url = WEBHOOK_URL
    # Get only normal users (users with role_id = 3)
    normal_users = User.query.filter(User.roles.any(id=3)).all()
    
    for user in normal_users:
        latest_order = Orders.query.filter_by(userID=user.id).order_by(Orders.order_date.desc()).first()
        
        if latest_order is None:
            bot_message = {
                'text': f'Hello {user.username}, you have not placed any orders yet. Please visit our site to place an order.'
            }
        elif latest_order.order_date < (datetime.utcnow() - timedelta(days=1)):
            bot_message = {
                'text': f'Hello {user.username}, it has been more than 24 hours since your last order. Please visit our site to place another order.'
            }
        else:
            bot_message = {
                'text': f'Hello {user.username}, you have a recent order.'
            }
        
        message_headers = {'Content-Type': 'application/json; charset=UTF-8'}
        http_obj = Http()
        response = http_obj.request(
            uri=url,
            method='POST',
            headers=message_headers,
            body=dumps(bot_message),
        )
        
        print(response)
    
    return "Reminders sent successfully"


SMPTP_SERVER_HOST="localhost"
SMPTP_SERVER_PORT=1025
SENDER_ADDRESS="admin@gmail.com"
SENDER_PASSWORD=""


def send_email(to_address,subject,message,content="text",attachment_file=None):
    msg=MIMEMultipart()
    msg["From"]=SENDER_ADDRESS
    msg["To"]=to_address
    msg["Subject"]=subject
    if content=="html":      
        msg.attach(MIMEText(message,"html"))
    else:
        msg.attach(MIMEText(message,"plain"))
        
    if attachment_file:
        with open(attachment_file,"rb") as attachment:
            
            part =MIMEBase("application","octet-stream")
            part.set_payload(attachment.read())
            encoders.encode_base64(part)


    s=smtplib.SMTP(host=SMPTP_SERVER_HOST,port=SMPTP_SERVER_PORT)
    s.login(SENDER_ADDRESS,SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True





# @app.before_first_request
# def create_db():
#      db.create_all()
#      if not user_datastore.find_user(email="vishnuchenga@gmail.com"):
#           user_datastore.create_user(username= "vishnu",email="vishnuchenga@gmail.com",password=hash_password("1234"))
#           db.session.commit()


#      if not user_datastore.find_role('admin'):
#           user_datastore.create_role(name='Admin', description='Admin Related Role')
#           db.session.commit()


# @app.before_first_request()
# def create_db():
#      db.create_all()
#      user_datastore.find_or_create_role(name="Admin" ,description="Admin Related Role")
#      user_datastore.find_or_create_role(name="Store Manager" ,description="StoreManagaer Related Role")
#      user_datastore.find_or_create_role(name="User" ,description="Normal user")
#      db.session.commit()
#      if not user_datastore.find_user(email="admin@gmail.com"):
#           user_datastore.create_user(username= "admin",email="admin@gmail.com",password=hash_password("1234"), roles=["Admin"],approved=True)
#      db.session.commit()

@app.route("/trigger-celery-job")
def triggger_celery_job():
    a = generate_csv.delay()
    return{
        "task_id":a.id,
        "task_state":a.state,
        "task_result":a.result
    }


@app.route('/status/<id>')
def check_status(id):
    res= AsyncResult(id,app=celery)
    return{
        "task_id":res.id,
        "task_state":res.state,
        "task_result":res.result
    }
    


@app.route("/download-file")
def download_file():
    return send_file("static/Product_data.csv")

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/api/signup', methods=['POST'])
def signup():
    username =  request.json.get('username')
    email =  request.json.get('email')
    password =  request.json.get('password')
    role =  request.json.get('role')

    # Perform validation checks
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    
    hashed_password = hash_password(password)


    # Check if the user with the provided email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 409

    # Check if the role with the given name exists
    user_role = Role.query.filter_by(name=role).first()
    if not user_role:
        return jsonify({'message': 'Role does not exist'}), 400

    if role == "Store Manager":
        # If the role is "Store Manager," set the user to not active by default
        new_user = User(username=username, email=email, password=hashed_password, active=False,fs_uniquifier=True, roles=[user_role], approved=False)
    else:
        new_user = User(username=username, email=email, password=hashed_password, active=True,fs_uniquifier=True, roles=[user_role],approved=True)
        

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/get_user_role', methods=['GET'])
def get_user_role():
    if current_user.has_role('Admin'):
        return jsonify({'role': 'Admin'}), 200
    elif current_user.has_role('Store Manager'):
        return jsonify({'role': 'Store Manager'}), 200
    else:
        return jsonify({'role': 'User'}), 200
    


@app.route('/api/get_user_name', methods=['GET'])
def get_user_info():
    if current_user.is_authenticated:
        user_id = current_user.id
        user_name = current_user.username
        return jsonify({'user_id': user_id, 'username': user_name}), 200
    else:
        return jsonify({'message': 'User not authenticated'}), 401
    


    


@app.route("/api/get_categories", methods=["GET", "POST"])
@roles_accepted('Admin','Store Manager' ,'User')
@cache.cached(timeout=60, key_prefix='viewcategories') 
def viewcategories():
    # Query the database to get a list of categories
    start= perf_counter_ns()
    categories = Categories.query.all()
    stop=perf_counter_ns()
    print("time taken",stop - start)
    if categories:
        # If categories exist, format and return the list
        category_list = [{"C_ID": category.C_ID, "C_name": category.C_name} for category in categories]
        return jsonify({"categories": category_list})
    else:
        # If no categories exist, return a message
        return jsonify({"message": "No categories to display"})
    


@app.route('/api/approval_requests', methods=['GET'])
@roles_accepted('Admin')
def get_approval_requests():
    approval_requests = User.query.filter_by(approved=False).all()
    requests = []
    for user in approval_requests:
        requests.append({
            'username': user.username,
            'email': user.email,
            'role': user.roles[0].name,  # Assuming each user has one role
        })
    return jsonify({'approval_requests': requests}), 200


@app.route('/api/accept_request', methods=['POST'])
@roles_accepted('Admin')
def accept_request():
    # Parse the data from the request
    data = request.get_json()
    email = data.get('email')

    # Find the user with the provided email
    user = User.query.filter_by(email=email).first()

    if user:
        # Set the "active" and "approved" fields to True
        user.active = True
        user.approved = True
        db.session.commit()
        return jsonify({'message': 'Request accepted successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404
    
@app.route('/api/reject_request', methods=['POST'])
@roles_accepted('Admin')
def reject_request():
    # Parse the data from the request
    data = request.get_json()
    email = data.get('email')

    # Find the user with the provided email
    user = User.query.filter_by(email=email).first()

    if user:
        # Set the "active" and "approved" fields to False
        user.active = False
        user.approved = False
        db.session.commit()
        return jsonify({'message': 'Request rejected successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404
    


# Route to fetch category details based on C_ID
@app.route('/api/categories/<int:category_id>', methods=['GET'])
@roles_accepted('Admin','Store Manager')
def get_category_details(category_id):
    category = Categories.query.filter_by(C_ID=category_id).first()

    if category:
        # Assuming you want to return the category name
        return jsonify({'category': {'name': category.C_name}})
    else:
        return jsonify({'error': 'Category not found'}), 404
    

@app.route('/api/update_categories/<int:category_id>', methods=['PUT'])
@roles_accepted('Admin')
def update_category(category_id):
    # Fetch the category from the database
    category = Categories.query.filter_by(C_ID=category_id).first()

    if not category:
        # Handle the case where the category does not exist
        return jsonify({'error': 'Category not found'}), 404

    # Get the new category name from the request JSON
    new_category_name = request.json.get('C_name')

    # Update the category name
    category.C_name = new_category_name

    # Commit the changes to the database
    db.session.commit()

    # Return a success response
    return jsonify({'message': 'Category updated successfully'}), 200

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@roles_accepted('Admin')
def delete_category(category_id):
    try:
        # Find the category by ID
        category = Categories.query.filter_by(C_ID=category_id).first()

        if category:
            # Delete the category
            db.session.delete(category)
            db.session.commit()

            return jsonify({'message': 'Category deleted successfully'}), 200
        else:
            return jsonify({'error': 'Category not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route for adding a new category
@app.route('/api/categories', methods=['POST'])
@roles_accepted('Admin')
def add_category():
    try:
        # Get the new category name from the request data
        new_category_name = request.json.get('C_name')

        # Validate and add the new category to the database
        if new_category_name:
            new_category = Categories(C_name=new_category_name)
            db.session.add(new_category)
            db.session.commit()

            return jsonify({'message': 'Category added successfully'}), 201
        else:
            return jsonify({'error': 'Invalid category name'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



@app.route('/api/categories/<int:category_id>/products', methods=['GET'])
@roles_accepted('Admin','Store Manager','User')
@cache.cached(timeout=60) 
def get_products_by_category(category_id):
    try:
        current_app.logger.info(f"Fetching products for category ID: {category_id}")
        # Query the database to get products for the specified category
        products = Products.query.filter_by(C_ID=category_id).all()
        print(products)  
        # Check if products were found
        if products:
            # Convert products to a list of dictionaries
            products_data = [
                {
                    'P_ID': product.P_ID,
                    'P_name': product.P_name,
                    'unit': product.unit,
                    'price_per_unit': product.price_per_unit,
                    'manf_exp_Date': product.manf_exp_Date,
                    'umo_id': product.umo_id,
                    'avable_qunty': product.avable_qunty,
                    'remaining_quantity': product.remaining_quantity
                    # Add other fields as needed
                }
                for product in products
            ]

            return jsonify({'products': products_data}), 200
        else:
            # No products found for the specified category
            return jsonify({'message': 'No products found for the category'})

    except Exception as e:
        current_app.logger.error(f"Error fetching products: {e}")
        # Handle exceptions (e.g., database errors)
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/products', methods=['POST'])
@roles_accepted('Store Manager')
def save_product():
    # Assuming you are using JSON data in the request body
    product_data = request.get_json()

    # Process and save the product data to the database
    new_product = Products(
        C_ID=product_data['C_ID'],
        P_name=product_data['P_name'],
        unit=product_data['unit'],
        price_per_unit=product_data['price_per_unit'],
        manf_exp_Date=product_data['manf_exp_Date'],
        umo_id=product_data['umo_id'],
        avable_qunty=product_data['avable_qunty'],
        remaining_quantity=product_data['avable_qunty']
    )

    db.session.add(new_product)
    db.session.commit()

    # Respond with a success message
    return jsonify({'message': 'Product saved successfully'}), 200

@app.route('/api/uom', methods=['GET'])
@roles_accepted('Store Manager')
def get_uom_options():
    try:
        # Query the database to get UOM options
        uom_options = uom.query.all()

        # Convert UOM options to a list of dictionaries
        uom_options_data = [
            {
                'id': uom.uom_id,
                'name': uom.uom_name,
            }
            for uom in uom_options
        ]

        return jsonify({'uomOptions': uom_options_data}), 200

    except Exception as e:
        # Handle exceptions (e.g., database errors)
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/update-product', methods=['PUT'])
@roles_accepted('Store Manager')
def update_product():
    try:
        # Assuming you are using JSON data in the request body
        updated_product_data = request.get_json()

        # Extract product ID from the data
        product_id = updated_product_data.get('P_ID')

        # Fetch the existing product from the database
        existing_product = Products.query.get(product_id)

        if existing_product:
            # Update the product properties
            existing_product.P_name = updated_product_data.get('P_name')
            existing_product.unit = updated_product_data.get('unit')
            existing_product.price_per_unit = updated_product_data.get('price_per_unit')
            existing_product.manf_exp_Date = updated_product_data.get('manf_exp_Date')
            existing_product.umo_id = updated_product_data.get('umo_id')
            existing_product.avable_qunty = updated_product_data.get('avable_qunty')
            # Add other properties as needed

            # Commit the changes to the database
            db.session.commit()

            # Respond with a success message
            return jsonify({'message': 'Product updated successfully'}), 200
        else:
            # Product not found
            return jsonify({'message': 'Product not found'}), 404

    except Exception as e:
        # Handle any errors that occur during processing
        return jsonify({'error': str(e)}), 500
    


@app.route('/api/delete-product/<int:product_id>', methods=['DELETE'])
@roles_accepted('Store Manager')
def delete_product(product_id):
    try:
        # Fetch the product from the database
        product = Products.query.get(product_id)

        if product:
            # Delete the product
            db.session.delete(product)
            db.session.commit()

            # Respond with a success message
            return jsonify({'message': 'Product deleted successfully'}), 200
        else:
            # Product not found
            return jsonify({'message': 'Product not found'}), 404

    except Exception as e:
        # Handle any errors that occur during processing
        return jsonify({'error': str(e)}), 500


@app.route('/api/send-edit-request', methods=['POST'])
@roles_accepted('Store Manager')
def send_edit_request():
    try:
        # Get data from the request
        request_data = request.get_json()
        current_app.logger.info(f"Received edit request data: {request_data}")

        # Create an EditRequest instance and add it to the database
        edit_request = EditRequest(
            category_id=request_data.get('categoryId'),
            current_category_name=request_data.get('currentCategoryName'),  # Add this line
            new_category_name=request_data.get('newCategoryName')
        )
        db.session.add(edit_request)
        db.session.commit()

        # Notify admin or perform any necessary actions
        admin_notification_message = f"Edit request for category ID {edit_request.category_id} received. Current category name: {edit_request.current_category_name}. New category name: {edit_request.new_category_name}"
        current_app.logger.info(admin_notification_message)

        # Respond with a success message
        return jsonify({'message': 'Edit request sent successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing edit request: {e}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/admin/edit-requests', methods=['GET'])
@roles_accepted('Admin')
def get_edit_requests():
    try:
        # Fetch all edit requests from the database
        edit_requests = EditRequest.query.all()

        # Convert the edit requests to a list of dictionaries
        edit_requests_data = [
            {
                'categoryId': request.category_id,
                'currentCategoryName': request.current_category_name,  # Include the current category name
                'newCategoryName': request.new_category_name
            }
            for request in edit_requests
        ]

        return jsonify({'editRequests': edit_requests_data}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching edit requests: {e}")
        return jsonify({'error': 'Error fetching edit requests'}), 500
    

@app.route('/api/admin/accept-edit-request/<int:category_id>', methods=['POST'])
@roles_accepted('Admin')
def accept_edit_request(category_id):
    try:
        # Find the corresponding edit request in the database
        edit_request = EditRequest.query.filter_by(category_id=category_id).first()

        if edit_request:
            # Apply the changes to the category in the Categories table
            category = Categories.query.get(category_id)
            category.C_name = edit_request.new_category_name

            # Remove the edit request from the database
            db.session.delete(edit_request)

            # Commit the changes to the database
            db.session.commit()

            return jsonify({'message': 'Edit request accepted successfully'}), 200
        else:
            return jsonify({'error': 'Edit request not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/admin/reject-edit-request/<int:category_id>', methods=['POST'])
@roles_accepted('Admin')
def reject_edit_request(category_id):
    try:
        # Find the corresponding edit request in the database
        edit_request = EditRequest.query.filter_by(category_id=category_id).first()

        if edit_request:
            # Remove the edit request from the database
            db.session.delete(edit_request)

            # Commit the changes to the database
            db.session.commit()

            return jsonify({'message': 'Edit request rejected successfully'}), 200
        else:
            return jsonify({'error': 'Edit request not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/search', methods=['GET'])
@roles_accepted('User')
def search():
    search_query = request.args.get('q')

    if search_query:
        # Perform a search in both Categories and Products tables
        category_results = Categories.query.filter(or_(Categories.C_name.ilike(f'%{search_query}%'))).all()
        product_results = Products.query.filter(or_(Products.P_name.ilike(f'%{search_query}%'), Products.manf_exp_Date.ilike(f'%{search_query}%'))).all()

        # Format the results as needed
        category_results_formatted = []
        product_results_formatted = [{'P_ID': product.P_ID, 'P_name': product.P_name, 'manf_exp_Date': product.manf_exp_Date, 'price_per_unit': product.price_per_unit, 'unit': product.unit } for product in product_results]

        # If categories are found, get products in each category
        for category in category_results:
            products_in_category = Products.query.filter(Products.C_ID == category.C_ID).all()
            products_in_category_formatted = [{'P_ID': product.P_ID, 'P_name': product.P_name, 'manf_exp_Date': product.manf_exp_Date, 'price_per_unit': product.price_per_unit, 'unit': product.unit } for product in products_in_category]

            # Create a dictionary to hold the category information, including the products
            category_info = {'C_ID': category.C_ID, 'C_name': category.C_name, 'products': products_in_category_formatted}
            category_results_formatted.append(category_info)

        # Combine and return the results
        search_results = {'categories': category_results_formatted, 'products': product_results_formatted}
        return jsonify(search_results)
    else:
        return jsonify({'error': 'Missing search query parameter'}), 400



@app.route('/api/checkout', methods=['POST'])
@roles_accepted('User')
def checkout():
    try:
        data = request.get_json()

        # Assuming you have a user ID associated with the current session
        user_id = current_user.id

        # Create a new order
        order = Orders(userID=user_id)
        db.session.add(order)
        db.session.commit()

        order_details_list = []  # Create a list to store order details

        # Add order items
        for item in data['items']:
            product = Products.query.get(item['product_id'])
            if product:
                order_item = OrderDetails(
                    orderID=order.orderID,
                    userID=user_id,
                    productID=item['product_id'],
                    product_name=product.P_name,
                    price_per_unit=product.price_per_unit,
                    quantity=item['quantity'],
                    total_price=item['total']
                )
                order_details_list.append(order_item)

                # Update product quantities
                product.remaining_quantity -= item['quantity']

        # Calculate the grand total for the order
        grand_total = sum(detail.total_price for detail in order_details_list)

        # Update and add all order details to the session
        for detail in order_details_list:
            detail.grand_total = grand_total
            db.session.add(detail)

        db.session.commit()

        return jsonify({'message': 'Checkout successful'}), 200
    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error during checkout'}), 500



@app.route('/api/orders', methods=['GET'])
@roles_accepted('User')
def view_orders():
    try:
        # Assuming you have a user ID associated with the current session
        user_id = current_user.id

        # Fetch all orders placed by the user
        orders = Orders.query.filter_by(userID=user_id).all()

        # Prepare a list to store order details
        orders_list = []

        for order in orders:
            # Fetch order details for each order
            order_details = OrderDetails.query.filter_by(orderID=order.orderID).all()

            # Calculate grand total for the order
            grand_total = sum(detail.total_price for detail in order_details)

            # Prepare a list to store order details for the current order
            order_details_list = []

            for detail in order_details:
                order_details_list.append({
                    'productID': detail.productID,
                    'product_name': detail.product_name,
                    'price_per_unit': detail.price_per_unit,
                    'quantity': detail.quantity,
                    'total_price': detail.total_price
                })

            # Add order information along with details to the main list
            orders_list.append({
                'orderID': order.orderID,
                'order_date': order.order_date,
                'order_details': order_details_list,
                'grand_total': grand_total
            })

        return jsonify({'orders': orders_list}), 200

    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error fetching orders'}), 500

if __name__ == "__main__":
     app.run(host='0.0.0.0',port=5000,debug=True)
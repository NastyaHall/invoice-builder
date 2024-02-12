from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user
from validate_email_address import validate_email
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from flask_mail import Mail, Message


auth = Blueprint('auth', __name__)
serialzer = URLSafeTimedSerializer('sexretkdjnjsdn')
mail = Mail()

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember=True)
                return jsonify(success=True, message='Logged in successfully', for_item='')
            else:
                return jsonify(success=False, message='Incorrect password', for_item='password')
        else:
            return jsonify(success=False, message='Invalid email', for_item='email')
    return render_template("login.html", user=current_user)



@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        email = request.form.get('email')
        first_name = request.form.get('firstName')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify(success=False, message='Email is unavailable', for_item='email')
        else:
            new_user = User(email=email, 
                            first_name=first_name, 
                            password=generate_password_hash(password, method='sha256'), 
                            confirmed=False)
            db.session.add(new_user)
            db.session.commit()

            token = serialzer.dumps(email, salt='email-confirm')
            # msg = Message('Confirm Your Email:)', sender='anastasiiahalimurka@gmail.com', recipients=[email])
            # confirmation_link = url_for('auth.confirm_email', token=token, external=True)
            # msg.body = f'Your link is {confirmation_link}'
            # mail.send(msg)

            login_user(new_user, remember=True)
            print(token)
            return jsonify(success=True, message='Account was created!:)', for_item='', token=token)      
    return render_template("sign_up.html", user=current_user)


@auth.route('/confirm_email/<token>')
@login_required
def confirm_email(token):
    try:
        email = serialzer.loads(token, salt='email-confirm', max_age=3600)
    except SignatureExpired:
        return 'The token has expired'
    
    user = User.query.filter_by(email=email).first()

    if user:
        if user.confirmed:
            flash('Account already confirmed. Please login.', 'success')
            return redirect(url_for('views.home'))  
        else:
            user.confirmed = True
            db.session.commit()
            flash('Email confirmed successfully!', 'success')
            return redirect(url_for('views.home'))  
    else:
        flash('User not found', 'danger')
        return redirect(url_for('views.home'))
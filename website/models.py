from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from datetime import datetime

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(10000))
    unitPrice = db.Column(db.Float)
    quantity = db.Column(db.Integer)
    totalAmount = db.Column(db.Float)
    added_date = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    expanded_description = db.Column(db.String(10000))
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'unitPrice': self.unitPrice,
            'quantity': self.quantity,
            'totalAmount': self.totalAmount,
            'invoice_id': self.invoice_id, 
            'added_date': self.added_date,
            'expanded_description': self.expanded_description
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300))
    address = db.Column(db.String(1000))
    phone_number = db.Column(db.String(50))
    email = db.Column(db.String(150))
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone_number': self.phone_number,
            'email': self.email,
            'invoice_id': self.invoice_id
        }

class ContactInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300))
    phone_number = db.Column(db.String(50))
    email = db.Column(db.String(150), unique=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone_number': self.phone_number,
            'email': self.email,
            'invoice_id': self.invoice_id
        }

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    number = db.Column(db.Integer)
    date = db.Column(db.DateTime(timezone=True))
    terms = db.Column(db.String(300))
    items = db.relationship('Item')
    customers = db.relationship('Customer')
    contact_info = db.relationship('ContactInfo')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'number': self.number,
            'date': self.date.isoformat() if self.date else None,  
            'terms': self.terms,
            'items': [item.to_dict() for item in self.items],  
            'customers': [customer.to_dict() for customer in self.customers],  
            'contact_info': [contact.to_dict() for contact in self.contact_info],  
            'user_id': self.user_id
        }


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    confirmed = db.Column(db.Boolean, default=False) 
    invoices = db.relationship('Invoice')

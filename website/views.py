from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from . import db
from datetime import datetime
from mindee import Client, documents
from .models import User, Invoice, Customer, Item
import json


views = Blueprint('views', __name__)
mindee_client = Client(api_key="")

@views.route('/')
@login_required
def home():
    return render_template("home.html", user=current_user)

@views.route('/projects/<int:invoice_id>', methods=['GET'])
def project_board(invoice_id):
    invoice =  invoice_to_delete = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first() 

    if invoice:
        print(f"invoice {invoice.id} was found")
        #return render_template('projectBoard.html', invoice=invoice, user=current_user)
        return jsonify(invoice.to_dict())
    else:
        #return render_template('project_not_found.html')
        return jsonify({'error': 'Invoice not found'}), 404


@views.route('/create_invoice', methods=['POST'])
@login_required
def create_invoice():
    if request.method == 'POST':
        data = request.json
        title = data.get('title')

        # Create a new invoice in the database
        new_invoice = Invoice(title=title, user_id=current_user.id)
        db.session.add(new_invoice)
        db.session.commit()

        return jsonify({'message': 'Invoice created successfully', 'invoice_id': new_invoice.id})

    return jsonify({'error': 'Invalid request'})


@views.route('/delete_invoice/<int:invoice_id>', methods=['DELETE'])
@login_required  # Make sure the user is logged in to delete an invoice
def delete_invoice(invoice_id):
    try:
        # Query the Invoice table for the invoice with the given ID
        invoice_to_delete = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()

        if invoice_to_delete:
            # Delete the invoice
            db.session.delete(invoice_to_delete)
            db.session.commit()
            return jsonify({'message': f'Invoice {invoice_id} deleted successfully'})
        else:
            return jsonify({'error': 'Invoice not found'}), 404  # Return a 404 Not Found status if the invoice was not found

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500 
    

@views.route('/save_changes_to_invoice/<int:invoice_id>', methods=['POST'])
@login_required 
def save_changes_to_invoice(invoice_id):
    try:
        invoice_to_change = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        data = request.json

        new_title = data.get('title')
        new_number = data.get('number')
        new_date = data.get('date')
        new_terms = data.get('terms')
        new_item = data.get('item', {})
        new_customer = data.get('customer', {})
        new_contact_info = data.get('contact_info', {})

        if new_title:
            invoice_to_change.title = new_title
        if new_number:
            invoice_to_change.number = new_number
        if new_date:
            invoice_to_change.date = new_date
        if new_terms:
            invoice_to_change.terms = new_terms


        if new_customer:
            print("there's new customer")
            if invoice_to_change.customers:
                # change the invoice_to_change.customers[0]
                if new_customer.get('name'):
                    invoice_to_change.customers[0].name = new_customer.get('name')
                if new_customer.get('address'):
                    invoice_to_change.customers[0].address = new_customer.get('address')
                if new_customer.get('phone_number'):
                    invoice_to_change.customers[0].phone_number = new_customer.get('phone_number')
                if new_customer.get('email'):
                    invoice_to_change.customers[0].email = new_customer.get('email')
            else:
                customer = Customer(name=new_customer.get('name'), 
                                    address=new_customer.get('address'), 
                                    phone_number=new_customer.get('phone_number'),
                                    email=new_customer.get('email'),
                                    invoice_id=invoice_to_change.id)
                db.session.add(customer)

        if new_item:
            item = Item.query.filter_by(id=new_item.get('id'), invoice_id=invoice_id).first()
            item_data = new_item.get('data')
            item_data_type = new_item.get('dataType')

            if item_data_type == 'description':
                item.description = item_data
            if item_data_type == 'expanded_description':
                item.expanded_description = item_data
            if item_data_type == 'quantity':
                item.quantity = float(item_data)
                item.totalAmount = float(item_data) * item.unitPrice
            if item_data_type == 'unit-price':
                item.unitPrice = float(item_data)
                item.totalAmount = item.quantity * float(item_data)
        db.session.commit()
        return jsonify({'message': 'Invoice changed successfully'})


    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500 

@views.route('/create_new_invoice_item/<int:invoice_id>', methods=['POST'])
@login_required 
def create_new_invoice_item(invoice_id):
    try:
        invoice_to_change = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        data = request.json

        description = data.get('description')
        quantity = data.get('quantity')
        unit_price = data.get('unit_price')
        total_amount = float(quantity) * float(unit_price)

        item_date = data.get('date')
        if item_date:
            datetime_obj = datetime.strptime(item_date, '%Y-%m-%d %H:%M:%S.%f')            

        new_item = Item(
            description=description,
            quantity=quantity,
            unitPrice=unit_price,
            totalAmount=total_amount,
            added_date=datetime_obj if item_date is not None else datetime.utcnow(),
            invoice_id=invoice_to_change.id  # Assuming you have a relationship set up
        )
        

        # Add the new item to the invoice and commit it to the database
        invoice_to_change.items.append(new_item)
        db.session.add(new_item)
        db.session.commit()


        return jsonify({'message': 'Invoice item created successfully', 'invoice_item_id': new_item.id})

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500 
    

@views.route('/delete_invoice_item/<int:invoice_id>/<int:item_id>', methods=['DELETE'])
@login_required 
def delete_invoice_item(invoice_id, item_id):
    item = Item.query.filter_by(id=item_id, invoice_id=invoice_id).first()

    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed successfully'})
    else:
        return jsonify({'error': 'Item not found'}, 404)
    

def line_item_to_dict(line_item, id):
    return {
        "id": id,
        "description": line_item.description,
        "quantity": line_item.quantity,
        "unitPrice": line_item.unit_price,
        "amount": line_item.total_amount
    }

def add_invoice_item_from_pdf(invoice_id, description, quantity, unit_price, amount):
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()           

        new_item = Item(
            description=description,
            quantity=quantity,
            unitPrice=unit_price,
            totalAmount=amount,
            added_date=datetime.utcnow(),
            invoice_id=invoice.id  
        )
        
        invoice.items.append(new_item)
        db.session.add(new_item)
        db.session.commit()

        return (new_item.id)

    except Exception as e:
        print(e)
        return None

@views.route("/read_invoice_file/<int:invoice_id>", methods=["POST"])
@login_required 
def extract_data_from_pdf(invoice_id):
    pdf_file = request.files.get("pdf_file")
    file_name = request.form.get("file_name")

    pdf_bytes = pdf_file.read()

    input_doc = mindee_client.doc_from_bytes(pdf_bytes, file_name)
    api_response = input_doc.parse(documents.TypeInvoiceV4)
    items = []

    for line_item in  api_response.document.line_items:
        item_id = add_invoice_item_from_pdf(invoice_id, line_item.description, line_item.quantity, line_item.unit_price, line_item.total_amount)
        if item_id:
            item_json = line_item_to_dict(line_item, item_id)
            items.append(item_json)

    json_data = json.dumps(items)
    print(json_data)
    return json_data

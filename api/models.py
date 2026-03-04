from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Trip(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    start_date = db.Column(db.String(20))
    end_date = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('Member', backref='trip', lazy=True, cascade="all, delete-orphan")
    expenses = db.relationship('Expense', backref='trip', lazy=True, cascade="all, delete-orphan")

class Member(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = db.Column(db.String(36), db.ForeignKey('trip.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    photo_url = db.Column(db.String(255))
    whatsapp_number = db.Column(db.String(20))
    
    # Relationships for split calculation
    paid_expenses = db.relationship('Expense', backref='payer', lazy=True)

class Expense(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = db.Column(db.String(36), db.ForeignKey('trip.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    payer_id = db.Column(db.String(36), db.ForeignKey('member.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    participants = db.relationship('ExpenseParticipant', backref='expense', lazy=True, cascade="all, delete-orphan")

class ExpenseParticipant(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expense_id = db.Column(db.String(36), db.ForeignKey('expense.id'), nullable=False)
    member_id = db.Column(db.String(36), db.ForeignKey('member.id'), nullable=False)
    
    member = db.relationship('Member', backref='participations', lazy=True)

class MessageTemplate(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_default = db.Column(db.Boolean, default=False)

class Setting(db.Model):
    id = db.Column(db.String(36), primary_key=True, default='global_settings')
    timezone = db.Column(db.String(50), default='Asia/Kolkata')
    currency = db.Column(db.String(10), default='INR ₹')
    theme = db.Column(db.String(20), default='system')

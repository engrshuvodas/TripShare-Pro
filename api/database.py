from .models import db, Setting, MessageTemplate

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        # Initial data
        if not Setting.query.first():
            db.session.add(Setting())
        
        if not MessageTemplate.query.first():
            default_tmpl = MessageTemplate(
                name="Default Template",
                content="Trip: {{trip_name}}\n\nTotal Cost: ₹{{total_cost}}\n\nHello {{member_name}},\nYou need to pay ₹{{member_balance}}.\n\nThank you!",
                is_default=True
            )
            db.session.add(default_tmpl)
        
        db.session.commit()

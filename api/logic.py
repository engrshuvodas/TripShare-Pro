from .models import Expense, ExpenseParticipant, Member

def calculate_trip_balances(trip):
    """
    Calculates the total paid, share, and balance for each member in a trip.
    """
    members = {m.id: {"name": m.name, "paid": 0.0, "share": 0.0, "balance": 0.0} for m in trip.members}
    total_trip_cost = 0.0

    for expense in trip.expenses:
        total_trip_cost += expense.amount
        
        # Add to payer's total paid
        if expense.payer_id in members:
            members[expense.payer_id]["paid"] += expense.amount
        
        # Calculate share per participant
        participants = expense.participants
        if not participants:
            continue
            
        share_per_head = expense.amount / len(participants)
        for p in participants:
            if p.member_id in members:
                members[p.member_id]["share"] += share_per_head

    # Final balance calculation
    for m_id in members:
        members[m_id]["balance"] = members[m_id]["paid"] - members[m_id]["share"]

    return {
        "total_cost": total_trip_cost,
        "member_count": len(trip.members),
        "per_person_average": total_trip_cost / len(trip.members) if trip.members else 0,
        "members": list(members.values())
    }

def format_whatsapp_message(template_content, trip_name, total_cost, member_name, member_balance):
    """
    Replaces variables in the template with actual values and encodes for URL.
    """
    import urllib.parse
    
    msg = template_content.replace("{{trip_name}}", trip_name)
    msg = msg.replace("{{total_cost}}", str(total_cost))
    msg = msg.replace("{{member_name}}", member_name)
    msg = msg.replace("{{member_balance}}", f"{member_balance:,.2f}")
    
    return urllib.parse.quote(msg)

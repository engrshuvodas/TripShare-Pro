import React, { useMemo } from 'react';
import { useTrip } from '../context/TripContext';

const SettlementSummary = ({ trip, expenses, currency, onSendWhatsApp }) => {
    const { data } = useTrip();
    const currencySymbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '€');

    const balances = useMemo(() => {
        const members = data.members.filter(m => trip.memberIds.includes(m.id));
        return members.map(m => {
            const paid = expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + parseFloat(e.amount), 0);
            let share = 0;
            expenses.forEach(e => {
                if (e.splitBetweenIds.includes(m.id)) {
                    share += parseFloat(e.amount) / e.splitBetweenIds.length;
                }
            });
            return { ...m, paid, share, balance: paid - share };
        });
    }, [data.members, trip.memberIds, expenses]);

    return (
        <div className="flex-col gap-sm">
            {balances.map(t => (
                <div key={t.id} className="card glass mb-sm p-md flex-between">
                    <div className="flex-center gap-md">
                        {t.photo ? (
                            <img src={t.photo} className="avatar-sm" alt={t.name} />
                        ) : (
                            <div className="avatar-sm flex-center">👤</div>
                        )}
                        <div>
                            <strong className="block text-sm">{t.name}</strong>
                            <p className="text-xs text-secondary">Spent: {currencySymbol}{t.paid.toFixed(0)}</p>
                        </div>
                    </div>
                    <div className="flex-center gap-md">
                        <div className={`text-sm font-bold ${t.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {t.balance >= 0 ? '+' : ''}{currencySymbol}{t.balance.toFixed(0)}
                        </div>
                        <button
                            className="btn-icon glass"
                            style={{ width: 32, height: 32, color: '#25D366' }}
                            onClick={() => onSendWhatsApp(t)}
                            title="Send WhatsApp Summary"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            ))}
            {balances.length === 0 && (
                <div className="card glass text-center py-md text-secondary text-sm">No members added to this trip.</div>
            )}
        </div>
    );
};

export default SettlementSummary;

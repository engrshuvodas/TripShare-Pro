import React from 'react';
import { useTrip } from '../context/TripContext';
import { motion } from 'framer-motion';

const getCategoryIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('food') || t.includes('eat') || t.includes('dinner')) return '🍔';
    if (t.includes('fuel') || t.includes('petrol') || t.includes('gas')) return '⛽';
    if (t.includes('hotel') || t.includes('stay') || t.includes('room')) return '🏨';
    if (t.includes('ticket') || t.includes('flight') || t.includes('train')) return '🎫';
    if (t.includes('drink') || t.includes('beer') || t.includes('bar')) return '🍻';
    return '💸';
};

const ExpenseList = ({ expenses, currency }) => {
    const { data } = useTrip();
    const currencySymbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '€');

    if (expenses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card glass text-center py-xl text-secondary"
            >
                No expenses yet.
            </motion.div>
        );
    }

    const grouped = expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
        .reduce((acc, exp) => {
            const date = new Date(exp.date).toLocaleDateString('en-IN', { dateStyle: 'long' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(exp);
            return acc;
        }, {});

    return (
        <div className="flex-col gap-lg">
            {Object.entries(grouped).map(([date, items], groupIdx) => (
                <motion.div
                    key={date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIdx * 0.1 }}
                    className="expense-group"
                >
                    <div className="text-xs text-muted mb-sm uppercase font-bold tracking-widest">{date}</div>
                    <div className="flex-col gap-sm">
                        {items.map((exp, idx) => {
                            const payer = data.members.find(m => m.id === exp.paidBy);
                            return (
                                <motion.div
                                    key={exp.id}
                                    whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                                    className="card glass p-md flex-between"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex-center gap-md">
                                        <div className="avatar-sm flex-center glass" style={{ fontSize: '1.2rem' }}>{getCategoryIcon(exp.title)}</div>
                                        <div>
                                            <strong className="block text-sm">{exp.title}</strong>
                                            <span className="text-xs text-secondary">Paid by {payer ? payer.name : 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold gradient-text">{currencySymbol}{parseFloat(exp.amount).toLocaleString()}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ExpenseList;

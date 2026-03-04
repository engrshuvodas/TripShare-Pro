import React from 'react';

const SpendingChart = ({ expenses, currency }) => {
    const dailyData = expenses.reduce((acc, exp) => {
        const day = new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        acc[day] = (acc[day] || 0) + parseFloat(exp.amount);
        return acc;
    }, {});

    const dates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
    const maxAmount = Math.max(...Object.values(dailyData), 100);
    const currencySymbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '€');

    return (
        <div className="chart-container flex-row gap-md items-end" style={{ height: 200 }}>
            {dates.map(date => {
                const amount = dailyData[date];
                const height = (amount / maxAmount) * 100;
                return (
                    <div key={date} className="chart-bar-wrapper flex-col items-center flex-1">
                        <div className="chart-bar w-full" style={{ height: `${height}%`, minWidth: 20 }}></div>
                        <div className="chart-tooltip">{currencySymbol}{amount.toLocaleString()}</div>
                        <div className="chart-bar-label mt-sm text-xs opacity-60">{date}</div>
                    </div>
                );
            })}
            {dates.length === 0 && (
                <div className="flex-center w-full h-full text-secondary text-sm">No spending data available</div>
            )}
        </div>
    );
};

export default SpendingChart;

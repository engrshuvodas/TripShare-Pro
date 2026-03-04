import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('tripsplit_pro_react_db');
        return saved ? JSON.parse(saved) : {
            trips: [],
            members: [],
            expenses: [],
            settings: {
                theme: 'dark',
                currency: 'INR',
                timezone: 'Asia/Kolkata'
            },
            templates: [
                {
                    id: '1',
                    name: 'Professional Summary',
                    body: '🌴 *TripSplit Pro Summary*\n--------------------------\n📍 *Trip:* {trip_name}\n🗺️ *Location:* {trip_location}\n👤 *Member:* {member_name}\n\n📊 *Final Breakdown:* \n🔸 Total Trip Expense: {total_currency}{total_amount}\n🔸 Your Share: {total_currency}{share_amount}\n\n💰 *Status:* {status_label} *{total_currency}{balance}*\n\n--------------------------\n_Sent via TripSplit Pro ⚛️_'
                }
            ]
        };
    });

    useEffect(() => {
        localStorage.setItem('tripsplit_pro_react_db', JSON.stringify(data));
    }, [data]);

    const addTrip = (trip) => {
        const newTrip = { ...trip, id: Date.now().toString() };
        setData(prev => ({ ...prev, trips: [...prev.trips, newTrip] }));
        return newTrip;
    };

    const deleteTrip = (id) => {
        setData(prev => ({
            ...prev,
            trips: prev.trips.filter(t => t.id !== id),
            expenses: prev.expenses.filter(e => e.tripId !== id)
        }));
    };

    const updateSettings = (newSettings) => {
        setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
    };

    const addMember = (member) => {
        setData(prev => ({
            ...prev,
            members: [...prev.members, { ...member, id: Date.now().toString() }]
        }));
    };

    const updateMember = (id, updatedMember) => {
        setData(prev => ({
            ...prev,
            members: prev.members.map(m => m.id === id ? { ...updatedMember, id } : m)
        }));
    };

    const deleteMember = (id) => {
        setData(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== id)
        }));
    };

    const addExpense = (expense) => {
        setData(prev => ({
            ...prev,
            expenses: [...prev.expenses, { ...expense, id: Date.now().toString() }]
        }));
    };

    const deleteExpense = (id) => {
        setData(prev => ({
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        }));
    };

    const resetToDefaults = () => {
        const defaultMembers = [
            { id: '1', name: 'Shuvo', whatsapp: '8801765245872' },
            { id: '2', name: 'Promita', whatsapp: '8801912790430' },
            { id: '3', name: 'Monami', whatsapp: '917044528716' },
            { id: '4', name: 'Setu', whatsapp: '919933493538' },
            { id: '5', name: 'Arpita', whatsapp: '8801923701861' },
            { id: '6', name: 'Dipanjon', whatsapp: '918016370668' },
            { id: '7', name: 'Srijan', whatsapp: '8801643116647' }
        ];
        setData(prev => ({ ...prev, members: defaultMembers }));
    };

    const getCurrentTrip = () => data.trips[data.trips.length - 1];

    return (
        <TripContext.Provider value={{
            data, setData, addTrip, deleteTrip, updateSettings,
            addMember, updateMember, deleteMember, resetToDefaults,
            addExpense, deleteExpense, getCurrentTrip
        }}>
            {children}
        </TripContext.Provider>
    );
};

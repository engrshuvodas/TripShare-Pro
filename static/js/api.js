const isLocalFile = window.location.protocol === 'file:';
const API_BASE = '/api';

// --- MOCK DATABASE FOR OFFLINE / FILE MODE ---
const getDB = () => JSON.parse(localStorage.getItem('triply_db') || '{"trips":[], "members":[], "expenses":[], "templates":[], "settings":{"currency":"INR ₹", "timezone":"Asia/Kolkata", "theme":"system"}}');
const saveDB = (db) => localStorage.setItem('triply_db', JSON.stringify(db));

const api = {
    async request(endpoint, method = 'GET', data = null) {
        if (!isLocalFile) {
            try {
                const res = await fetch(`${API_BASE}${endpoint}`, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: data ? JSON.stringify(data) : null
                });
                return await res.json();
            } catch (e) {
                console.warn("Backend not reachable, falling back to LocalStorage.");
            }
        }
        return this.mockRequest(endpoint, method, data);
    },

    mockRequest(endpoint, method, data) {
        let db = getDB();
        const parts = endpoint.split('/').filter(p => p);

        // Trips
        if (endpoint === '/trips') {
            if (method === 'POST') {
                const newTrip = { ...data, id: Date.now().toString(), created_at: new Date() };
                db.trips.push(newTrip);
                saveDB(db);
                return newTrip;
            }
            return db.trips;
        }

        if (parts[0] === 'trips' && parts.length === 2) {
            const tripId = parts[1];
            if (method === 'DELETE') {
                db.trips = db.trips.filter(t => t.id !== tripId);
                db.members = db.members.filter(m => m.trip_id !== tripId);
                db.expenses = db.expenses.filter(e => e.trip_id !== tripId);
                saveDB(db);
                return { message: "Trip deleted" };
            }
            const trip = db.trips.find(t => t.id === tripId);
            if (!trip) throw new Error("Trip not found");

            // Calculate Stats Mock
            const tripMembers = db.members.filter(m => m.trip_id === tripId);
            const tripExpenses = db.expenses.filter(e => e.trip_id === tripId);
            let totalCost = 0;
            let memberStats = tripMembers.map(m => ({ name: m.name, paid: 0, share: 0, balance: 0 }));

            tripExpenses.forEach(e => {
                totalCost += parseFloat(e.amount);
                const payer = memberStats.find(m => m.name === db.members.find(mem => mem.id === e.payer_id)?.name);
                if (payer) payer.paid += parseFloat(e.amount);

                const perHead = parseFloat(e.amount) / e.apply_to.length;
                e.apply_to.forEach(pId => {
                    const participant = memberStats.find(m => m.name === db.members.find(mem => mem.id === pId)?.name);
                    if (participant) participant.share += perHead;
                });
            });

            memberStats.forEach(m => m.balance = m.paid - m.share);

            return {
                ...trip,
                stats: {
                    total_cost: totalCost,
                    member_count: tripMembers.length,
                    per_person_average: totalCost / (tripMembers.length || 1),
                    members: memberStats
                }
            };
        }

        // Members
        if (parts[0] === 'trips' && parts[2] === 'members') {
            const tripId = parts[1];
            if (method === 'POST') {
                const newMember = { ...data, id: Date.now().toString(), trip_id: tripId };
                db.members.push(newMember);
                saveDB(db);
                return newMember;
            }
            return db.members.filter(m => m.trip_id === tripId);
        }

        if (parts[0] === 'members') {
            const memberId = parts[1];
            if (method === 'DELETE') {
                db.members = db.members.filter(m => m.id !== memberId);
                saveDB(db);
                return { message: "Member deleted" };
            }
        }

        // Expenses
        if (parts[0] === 'trips' && parts[2] === 'expenses') {
            const tripId = parts[1];
            if (method === 'POST') {
                const newExpense = { ...data, id: Date.now().toString(), trip_id: tripId };
                // Fetch animations names for display
                newExpense.payer_name = db.members.find(m => m.id === data.payer_id)?.name || 'Unknown';
                newExpense.participants = data.apply_to.map(id => db.members.find(m => m.id === id)?.name);
                db.expenses.push(newExpense);
                saveDB(db);
                return newExpense;
            }
            return db.expenses.filter(e => e.trip_id === tripId).reverse();
        }

        // Settings & Templates
        if (endpoint === '/settings') {
            if (method === 'PUT') {
                db.settings = { ...db.settings, ...data };
                saveDB(db);
                return { message: "Settings saved" };
            }
            return db.settings;
        }

        if (endpoint === '/templates') {
            if (method === 'POST') {
                const newTmpl = { ...data, id: Date.now().toString() };
                if (data.is_default) db.templates.forEach(t => t.is_default = false);
                db.templates.push(newTmpl);
                saveDB(db);
                return newTmpl;
            }
            return db.templates.length > 0 ? db.templates : [{ name: "Default", content: "Trip: {{trip_name}}\nTotal: {{total_cost}}\nHello {{member_name}}, you owe {{member_balance}}.", is_default: true }];
        }

        return {};
    },

    getTrips: () => api.request('/trips'),
    getTrip: (id) => api.request(`/trips/${id}`),
    createTrip: (data) => api.request('/trips', 'POST', data),
    deleteTrip: (id) => api.request(`/trips/${id}`, 'DELETE'),
    getMembers: (tripId) => api.request(`/trips/${tripId}/members`),
    addMember: (tripId, data) => api.request(`/trips/${tripId}/members`, 'POST', data),
    updateMember: (id, data) => api.request(`/members/${id}`, 'PUT', data),
    deleteMember: (id) => api.request(`/members/${id}`, 'DELETE'),
    getExpenses: (tripId) => api.request(`/trips/${tripId}/expenses`),
    addExpense: (tripId, data) => api.request(`/trips/${tripId}/expenses`, 'POST', data),
    getSettings: () => api.request('/settings'),
    updateSettings: (data) => api.request('/settings', 'PUT', data),
    getTemplates: () => api.request('/templates'),
    saveTemplate: (data) => api.request('/templates', 'POST', data)
};

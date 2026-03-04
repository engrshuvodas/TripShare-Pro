document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentTripId = localStorage.getItem('currentTripId');
let activeView = 'trips';

async function initApp() {
    setupNavigation();
    loadSettings();
    renderView('trips');
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view !== 'trips' && view !== 'settings' && view !== 'about' && !currentTripId) {
                alert('Please select or create a trip first!');
                renderView('trips');
                return;
            }
            renderView(view);
        });
    });
}

async function renderView(view) {
    activeView = view;
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.view === view);
    });

    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="loader">Loading...</div>';

    try {
        switch (view) {
            case 'trips': await renderTripsView(container); break;
            case 'dashboard': await renderDashboardView(container); break;
            case 'members': await renderMembersView(container); break;
            case 'expenses': await renderExpensesView(container); break;
            case 'whatsapp': await renderWhatsAppView(container); break;
            case 'settings': await renderSettingsView(container); break;
            case 'about': renderAboutView(container); break;
        }
    } catch (error) {
        console.error('View Render Error:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                <h3>Connection Error</h3>
                <p class="text-muted">Unable to connect to the server. Please ensure the backend is running at <strong>http://localhost:5000</strong></p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="renderView('trips')">Try Again</button>
            </div>
        `;
    }
}

// --- TRIPS VIEW ---
async function renderTripsView(container) {
    const trips = await api.getTrips();
    container.innerHTML = `
        <header>
            <div>
                <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">YOUR JOURNEY</p>
                <h1>My Trips</h1>
            </div>
            <button class="btn btn-primary" onclick="showCreateTripModal()"><i class="fas fa-plus"></i> New Trip</button>
        </header>
        <div class="grid" id="trips-grid">
            ${trips.map((t, i) => `
                <div class="card trip-card" onclick="selectTrip('${t.id}')" style="opacity: 0; transform: translateY(20px)">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: var(--primary-gradient)"></div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                         <div style="background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 14px;">
                            <i class="fas fa-plane" style="color: var(--primary); font-size: 1.25rem"></i>
                        </div>
                        <i class="fas fa-trash text-muted" style="cursor: pointer; font-size: 0.8rem;" onclick="event.stopPropagation(); deleteTrip('${t.id}')"></i>
                    </div>
                    <h3 style="font-weight: 800; font-size: 1.4rem; margin-bottom: 0.5rem">${t.name}</h3>
                    <p class="text-muted" style="font-weight: 500; margin-bottom: 1rem;"><i class="fas fa-location-dot" style="margin-right: 5px"></i> ${t.location || 'Unknown'}</p>
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted)">
                        <i class="far fa-calendar"></i> ${t.start_date} - ${t.end_date}
                    </div>
                </div>
            `).join('')}
            ${trips.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><i class="fas fa-map-marked-alt" style="font-size: 4rem; color: var(--border); margin-bottom: 1rem;"></i><p class="text-muted">No trips found. Time to plan an adventure!</p></div>' : ''}
        </div>
    `;

    gsap.to(".trip-card", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
    });
}

function selectTrip(id) {
    currentTripId = id;
    localStorage.setItem('currentTripId', id);
    renderView('dashboard');
}

async function deleteTrip(id) {
    if (confirm('Are you sure you want to delete this trip and all its data?')) {
        await api.deleteTrip(id);
        if (currentTripId === id) {
            currentTripId = null;
            localStorage.removeItem('currentTripId');
        }
        renderView('trips');
    }
}

function showCreateTripModal() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <h2>Create New Trip</h2>
        <form id="create-trip-form" onsubmit="handleCreateTrip(event)">
            <div class="form-group">
                <label>Trip Name</label>
                <input type="text" name="name" required placeholder="e.g. Summer Vacation Kochi">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="location" placeholder="e.g. Kerala, India">
            </div>
            <div class="form-group" style="display: flex; gap: 1rem;">
                <div style="flex: 1">
                    <label>Start Date</label>
                    <input type="date" name="start_date" required>
                </div>
                <div style="flex: 1">
                    <label>End Date</label>
                    <input type="date" name="end_date" required>
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Trip</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';
}

async function handleCreateTrip(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const res = await api.createTrip(data);
    closeModal();
    selectTrip(res.id);
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// --- DASHBOARD VIEW ---
async function renderDashboardView(container) {
    let trip;
    try {
        trip = await api.getTrip(currentTripId);
    } catch (e) {
        localStorage.removeItem('currentTripId');
        currentTripId = null;
        renderView('trips');
        return;
    }
    const stats = trip.stats;
    container.innerHTML = `
        <header>
            <div>
                <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">TRIP OVERVIEW</p>
                <h1>${trip.name}</h1>
                <p class="text-muted"><i class="fas fa-location-dot"></i> ${trip.location} | <i class="fas fa-users"></i> ${stats.member_count} Members</p>
            </div>
            <div style="text-align: right">
                <div class="stat-value">${formatCurrency(stats.total_cost)}</div>
                <p class="text-muted" style="font-weight: 600">Total Group Spending</p>
            </div>
        </header>

        <div class="card fade-in" style="margin-bottom: 2.5rem; background: var(--primary-gradient); color: white; border: none;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="opacity: 0.9; font-weight: 500">Date-wise Explorer</h3>
                    <p style="opacity: 0.8; font-size: 0.9rem">Filter your expenses and track daily budgets</p>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <input type="date" id="dash-filter-date" style="width: auto; padding: 0.6rem 1rem; border-radius: 12px; border: none; background: rgba(255,255,255,0.2); color: white;">
                    <button class="btn" style="background: white; color: var(--primary); padding: 0.6rem 1.25rem;" onclick="filterDashboardByDate()">Filter Now</button>
                    <button class="btn" style="background: rgba(255,255,255,0.1); color: white; padding: 0.6rem 1rem; border: 1px solid rgba(255,255,255,0.2)" onclick="renderView('dashboard')">Reset</button>
                </div>
            </div>
            <div id="date-filtered-summary" class="hidden" style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(0,0,0,0.1); border-radius: 15px;">
                <!-- Filtered results go here -->
            </div>
        </div>
        
        <div class="grid" style="margin-bottom: 3rem;">
            <div class="card fade-in" style="animation-delay: 0.1s">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="text-muted" style="font-weight: 600; font-size: 0.8rem">AVERAGE SHARE</p>
                        <div class="stat-value">${formatCurrency(stats.per_person_average)}</div>
                    </div>
                    <div style="background: rgba(99, 102, 241, 0.1); padding: 10px; border-radius: 12px;">
                        <i class="fas fa-hand-holding-dollar" style="color: var(--primary); font-size: 1.5rem"></i>
                    </div>
                </div>
            </div>
            <div class="card fade-in" style="animation-delay: 0.2s">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="text-muted" style="font-weight: 600; font-size: 0.8rem">LATEST ACTIVITY</p>
                        <div id="recent-expense-label" style="font-size: 1.1rem; font-weight: 700; margin-top: 0.5rem">Loading...</div>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 12px;">
                        <i class="fas fa-clock-rotate-left" style="color: var(--secondary); font-size: 1.5rem"></i>
                    </div>
                </div>
            </div>
        </div>

        <h3 style="margin-bottom: 1.5rem">Group Balance Sheet</h3>
        <div class="card fade-in" style="animation-delay: 0.3s; padding: 1rem;">
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Total Paid</th>
                            <th>Share</th>
                            <th>Final Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.members.map(m => `
                            <tr>
                                <td style="font-weight: 700; font-size: 1.1rem">${m.name}</td>
                                <td>${formatCurrency(m.paid)}</td>
                                <td>${formatCurrency(m.share)}</td>
                                <td>
                                    <span style="padding: 0.4rem 0.8rem; border-radius: 10px; font-weight: 600; font-size: 0.85rem; background: ${m.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${m.balance >= 0 ? '#059669' : '#dc2626'}">
                                        ${m.balance >= 0 ? 'GETS ' + formatCurrency(m.balance) : 'OWES ' + formatCurrency(Math.abs(m.balance))}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                        ${stats.members.length === 0 ? '<tr><td colspan="4" style="padding: 3rem; text-align: center" class="text-muted">No members yet. Start by adding your squad!</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <h3>Recent Transactions</h3>
        <div class="card" style="margin-top: 1rem;">
            <div id="recent-transactions-list">
                <p class="text-muted">Loading transactions...</p>
            </div>
        </div>

        <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
             <button class="btn btn-primary" onclick="renderView('expenses')">Add Expense</button>
        </div>
    `;
    loadDashboardData();
}

// --- DASHBOARD DATA & LISTS ---
async function loadDashboardData() {
    loadRecentExpense();
    const expenses = await api.getExpenses(currentTripId);
    const list = document.getElementById('recent-transactions-list');
    if (expenses && expenses.length > 0) {
        list.className = "fade-in";
        list.innerHTML = expenses.slice(0, 5).map(e => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border)">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: rgba(99, 102, 241, 0.1); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-receipt" style="color: var(--primary)"></i>
                    </div>
                    <div>
                        <h5 style="margin: 0; font-size: 1rem; font-weight: 700">${e.title}</h5>
                        <p class="text-white text-muted" style="font-size: 0.75rem; font-weight: 500">${e.date} | Paid by ${e.payer_name}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-weight: 800; color: var(--primary); font-size: 1.1rem">${formatCurrency(e.amount)}</div>
                    <button class="btn btn-sm" style="background: var(--bg-main); font-weight: 700; font-size: 0.7rem; padding: 0.4rem 0.8rem;" onclick="viewExpense('${e.id}')">VIEW</button>
                </div>
            </div>
        `).join('');
    } else {
        list.innerHTML = '<div style="text-align: center; padding: 2rem;" class="text-muted"><i class="fas fa-ghost" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>No transactions recorded yet.</div>';
    }
}

async function filterDashboardByDate() {
    const date = document.getElementById('dash-filter-date').value;
    if (!date) return;

    const expenses = await api.getExpenses(currentTripId);
    const filtered = expenses.filter(e => e.date === date);
    const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);

    const summaryDiv = document.getElementById('date-filtered-summary');
    summaryDiv.classList.remove('hidden');
    summaryDiv.innerHTML = `
        <p><strong>Expenses on ${date}:</strong> ${filtered.length}</p>
        <p><strong>Total for this day:</strong> ${formatCurrency(total)}</p>
        <div style="margin-top: 0.5rem; font-size: 0.85rem">
            ${filtered.map(f => `• ${f.title}: ${formatCurrency(f.amount)}`).join('<br>')}
        </div>
    `;
}

// ... (keep previous functions) ...

function showAddTemplateModal() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <h2>Create Message Template</h2>
        <form id="add-template-form" onsubmit="handleAddTemplate(event)">
            <div class="form-group">
                <label>Template Name</label>
                <input type="text" name="name" required placeholder="e.g. Final Summary">
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea name="content" rows="6" required placeholder="Use variables: {{trip_name}}, {{total_cost}}, {{member_name}}, {{member_balance}}"></textarea>
            </div>
            <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" name="is_default" style="width: auto;">
                <label style="margin: 0">Set as Default</label>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Template</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';
}

async function handleAddTemplate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        content: formData.get('content'),
        is_default: formData.get('is_default') === 'on'
    };
    await api.saveTemplate(data);
    closeModal();
    renderView('settings');
}

async function loadRecentExpense() {
    const expenses = await api.getExpenses(currentTripId);
    const label = document.getElementById('recent-expense-label');
    if (expenses && expenses.length > 0) {
        label.innerHTML = `<strong>${expenses[0].title}</strong><br>${formatCurrency(expenses[0].amount)}<br>${expenses[0].date}`;
    } else {
        label.innerText = 'No expenses yet';
    }
}

// --- MEMBERS VIEW ---
async function renderMembersView(container) {
    const members = await api.getMembers(currentTripId);
    container.innerHTML = `
        <header>
            <div>
                 <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">TEAM MATES</p>
                <h1>Trip Members</h1>
            </div>
            <button class="btn btn-primary" onclick="showAddMemberModal()"><i class="fas fa-user-plus"></i> Add Member</button>
        </header>
        <div class="grid">
            ${members.map((m, i) => `
                <div class="card member-card" style="opacity: 0; transform: scale(0.9)">
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <div style="position: relative; margin-bottom: 1.5rem;">
                            <img src="${m.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name)}" style="width: 100px; height: 100px; border-radius: 30px; object-fit: cover; box-shadow: var(--shadow-md); border: 4px solid white;">
                            <div style="position: absolute; bottom: 5px; right: 5px; width: 22px; height: 22px; background: #10b981; border: 4px solid white; border-radius: 50%;"></div>
                        </div>
                        <h3 style="font-weight: 800; margin-bottom: 0.25rem;">${m.name}</h3>
                        <p class="text-muted" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 1.5rem;"><i class="fab fa-whatsapp" style="color: #25D366"></i> ${m.whatsapp_number}</p>
                        
                        <div style="display: flex; gap: 0.75rem; width: 100%;">
                            <button class="btn" style="flex: 1; padding: 0.6rem; font-size: 0.8rem; background: var(--bg-main); font-weight: 700;" onclick="viewMemberDetails('${m.id}')">PROFILE</button>
                            <button class="btn" style="padding: 0.6rem; background: rgba(239, 68, 68, 0.08); color: var(--danger);" onclick="deleteMember('${m.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('')}
            ${members.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><i class="fas fa-users-slash" style="font-size: 4rem; color: var(--border); margin-bottom: 1rem;"></i><p class="text-muted">No members yet. Time to build your team!</p></div>' : ''}
        </div>
    `;

    gsap.to(".member-card", {
        opacity: 1,
        scale: 1,
        stagger: 0.08,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
}

function showAddMemberModal() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <h2>Add Trip Member</h2>
        <form id="add-member-form" onsubmit="handleAddMember(event)">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" required placeholder="Full Name">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="text" name="whatsapp_number" placeholder="+91 1234567890">
            </div>
            <div class="form-group">
                <label>Photo URL (Optional)</label>
                <input type="text" name="photo_url" placeholder="Paste image link">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Member</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';
}

async function handleAddMember(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await api.addMember(currentTripId, data);
    closeModal();
    renderView('members');
}

async function deleteMember(id) {
    if (confirm('Delete this member and their expenses?')) {
        await api.deleteMember(id);
        renderView('members');
    }
}

async function viewMemberDetails(memberId) {
    const trip = await api.getTrip(currentTripId);
    const m = trip.stats.members.find(mem => mem.name === mem.name); // Simplified lookup
    // Actually need a better way to find the specific member from the detailed stats
    const apiMember = (await api.getMembers(currentTripId)).find(mem => mem.id === memberId);
    const statsMember = trip.stats.members.find(mem => mem.name === apiMember.name);

    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="${apiMember.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(apiMember.name)}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 1rem;">
            <h2>${apiMember.name}</h2>
            <p class="text-muted"><i class="fab fa-whatsapp"></i> ${apiMember.whatsapp_number}</p>
        </div>
        <div class="card" style="background: var(--bg-main); margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Total Paid:</span>
                <span style="font-weight: 700;">${formatCurrency(statsMember?.paid || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Total Share:</span>
                <span style="font-weight: 700;">${formatCurrency(statsMember?.share || 0)}</span>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between;">
                <span>Final Balance:</span>
                <span style="font-weight: 700; color: ${statsMember?.balance >= 0 ? '#10b981' : '#ef4444'}">
                    ${statsMember?.balance >= 0 ? 'Gets back ' : 'Owes '} ${formatCurrency(Math.abs(statsMember?.balance || 0))}
                </span>
            </div>
        </div>
        <button class="btn btn-primary" style="width: 100%" onclick="closeModal()">Close</button>
    `;
    modal.style.display = 'flex';
}

// --- EXPENSES VIEW ---
async function renderExpensesView(container) {
    const expenses = await api.getExpenses(currentTripId);
    container.innerHTML = `
        <header>
            <div>
                 <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">TRANSACTIONS</p>
                <h1>Trip Expenses</h1>
            </div>
            <button class="btn btn-primary" onclick="showAddExpenseModal()"><i class="fas fa-plus"></i> Add Expense</button>
        </header>
        <div class="card fade-in" style="padding: 1rem;">
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Paid By</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenses.map(e => `
                            <tr>
                                <td style="font-weight: 600; font-size: 0.9rem">${e.date}</td>
                                <td style="font-weight: 700; font-size: 1.1rem; color: var(--text-main)">${e.title}</td>
                                <td>
                                     <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="width: 24px; height: 24px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800;">${e.payer_name[0]}</div>
                                        <span>${e.payer_name}</span>
                                    </div>
                                </td>
                                <td style="font-weight: 800; font-size: 1.1rem; color: var(--primary)">${formatCurrency(e.amount)}</td>
                                <td>
                                    <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: var(--bg-main);" onclick="viewExpense('${e.id}')">DETAILS</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${expenses.length === 0 ? '<tr><td colspan="5" style="padding: 3rem; text-align: center" class="text-muted">No expenses recorded yet. Time to spend some money!</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function showAddExpenseModal() {
    const members = await api.getMembers(currentTripId);
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <h2>Add Expense</h2>
        <form id="add-expense-form" onsubmit="handleAddExpense(event)">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" required placeholder="e.g. Dinner at Beach">
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" step="0.01" name="amount" required placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Who Paid?</label>
                <select name="payer_id" required>
                    ${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Apply to Members (Split among)</label>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem;">
                    ${members.map(m => `
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <input type="checkbox" name="apply_to" value="${m.id}" checked style="width: auto;">
                            <span>${m.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Expense</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';
}

async function handleAddExpense(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        payer_id: formData.get('payer_id'),
        apply_to: formData.getAll('apply_to')
    };
    await api.addExpense(currentTripId, data);
    closeModal();
    renderView('expenses');
}

async function viewExpense(id) {
    const expenses = await api.getExpenses(currentTripId);
    const e = expenses.find(exp => exp.id === id);
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <h2>Expense Details</h2>
        <div style="margin: 1.5rem 0;">
            <h1 style="color: var(--primary)">${formatCurrency(e.amount)}</h1>
            <p style="font-size: 1.2rem; font-weight: 600;">${e.title}</p>
            <p class="text-muted"><i class="fas fa-calendar"></i> ${e.date}</p>
        </div>
        <div class="card" style="background: var(--bg-main); padding: 1rem;">
             <p><strong>Paid by:</strong> ${e.payer_name}</p>
             <p style="margin-top: 0.5rem;"><strong>Split among:</strong> ${e.participants.join(', ')}</p>
             <p style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                <strong>Per Head:</strong> ${formatCurrency(e.amount / e.participants.length)}
             </p>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="closeModal()">Close</button>
    `;
    modal.style.display = 'flex';
}

// --- WHATSAPP VIEW ---
async function renderWhatsAppView(container) {
    const trip = await api.getTrip(currentTripId);
    const members = await api.getMembers(currentTripId);
    const templates = await api.getTemplates();
    const defaultTmpl = templates.find(t => t.is_default) || templates[0];

    container.innerHTML = `
        <header>
            <div>
                <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">NOTIFICATIONS</p>
                <h1>WhatsApp Sync</h1>
            </div>
        </header>
        <div class="card fade-in" style="margin-bottom: 3rem; border: 2px solid var(--primary);">
            <div style="display: flex; gap: 2rem; align-items: center;">
                <div style="background: rgba(37, 211, 102, 0.1); padding: 20px; border-radius: 20px;">
                    <i class="fab fa-whatsapp" style="color: #25D366; font-size: 2.5rem"></i>
                </div>
                <div style="flex: 1">
                    <h3 style="margin-bottom: 0.5rem">Bulk Message Delivery</h3>
                    <p class="text-muted" style="margin-bottom: 1.5rem">Send individual payment summaries to all members with a single click using your selected template.</p>
                    <div style="display: flex; gap: 1rem;">
                        <select id="template-selector" style="flex: 1; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--border); font-weight: 600;">
                            ${templates.map(t => `<option value="${t.id}" ${t.is_default ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="sendBulkWhatsApp()">SEND ALL</button>
                    </div>
                </div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1.5rem">Member Summary Cards</h3>
        <div class="grid">
            ${trip.stats.members.map((m, i) => {
        const memberData = members.find(mem => mem.name === m.name);
        return `
                <div class="card wa-card fade-in" style="animation-delay: ${0.1 + (i * 0.05)}s">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="font-weight: 800;">${m.name}</h4>
                        <span style="font-size: 0.75rem; font-weight: 700; color: ${m.balance >= 0 ? 'var(--secondary)' : 'var(--danger)'}">
                            ${m.balance >= 0 ? '+' : ''}${formatCurrency(m.balance)}
                        </span>
                    </div>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.5rem;">${memberData?.whatsapp_number || 'No number set'}</p>
                    <button class="btn" style="width: 100%; justify-content: center; background: var(--bg-main); font-size: 0.8rem; font-weight: 800;" onclick="sendSingleWhatsApp('${m.name}', ${m.balance}, '${memberData?.whatsapp_number || ''}')">
                        SEND INDIVIDUAL
                    </button>
                </div>
                `;
    }).join('')}
        </div>
    `;
}

async function sendSingleWhatsApp(name, balance, number) {
    if (!number) { alert('No number found for this member!'); return; }
    const templateId = document.getElementById('template-selector').value;
    const templates = await api.getTemplates();
    const tmpl = templates.find(t => t.id === templateId);
    const trip = await api.getTrip(currentTripId);

    let msg = tmpl.content
        .replace("{{trip_name}}", trip.name)
        .replace("{{total_cost}}", trip.stats.total_cost)
        .replace("{{member_name}}", name)
        .replace("{{member_balance}}", Math.abs(balance).toFixed(2));

    if (balance > 0) {
        msg = msg.replace("You need to pay", "You will get back");
    }

    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function sendBulkWhatsApp() {
    const trip = await api.getTrip(currentTripId);
    const members = await api.getMembers(currentTripId);

    for (const m of trip.stats.members) {
        const memberData = members.find(mem => mem.name === m.name);
        if (memberData && memberData.whatsapp_number) {
            await sendSingleWhatsApp(m.name, m.balance, memberData.whatsapp_number);
        }
    }
}

// --- SETTINGS VIEW ---
async function renderSettingsView(container) {
    const settings = await api.getSettings();
    container.innerHTML = `
        <header>
            <div>
                 <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">PREFERENCES</p>
                <h1>Settings</h1>
            </div>
        </header>
        <div class="grid">
            <div class="card fade-in">
                <h3 style="margin-bottom: 1.5rem">Core Configuration</h3>
                <form id="settings-form" onsubmit="handleSaveSettings(event)">
                    <div class="form-group">
                        <label>Display Currency</label>
                        <select name="currency">
                            <option value="INR ₹" ${settings.currency === 'INR ₹' ? 'selected' : ''}>Indian Rupee (₹)</option>
                            <option value="USD $" ${settings.currency === 'USD $' ? 'selected' : ''}>US Dollar ($)</option>
                            <option value="EUR €" ${settings.currency === 'EUR €' ? 'selected' : ''}>Euro (€)</option>
                            <option value="GBP £" ${settings.currency === 'GBP £' ? 'selected' : ''}>British Pound (£)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>System Timezone</label>
                        <select name="timezone">
                            <option value="Asia/Kolkata" ${settings.timezone === 'Asia/Kolkata' ? 'selected' : ''}>(GMT+05:30) Mumbai, Delhi</option>
                            <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC Standard</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label>Visual Interface</label>
                        <select name="theme" onchange="applyTheme(this.value)">
                            <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>Sync with System</option>
                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Always Light</option>
                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Deep Dark Mode</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">SAVE CHANGES</button>
                </form>
            </div>

            <div class="card fade-in" style="animation-delay: 0.1s">
                <h3 style="margin-bottom: 0.5rem">Notification Templates</h3>
                <p class="text-muted" style="margin-bottom: 2rem; font-size: 0.9rem;">Manage how your WhatsApp summaries look.</p>
                <div style="background: var(--bg-main); padding: 1.5rem; border-radius: 15px; text-align: center; border: 1px dashed var(--border);">
                    <i class="fas fa-message" style="font-size: 2.5rem; color: var(--border); margin-bottom: 1rem;"></i>
                    <p class="text-muted" style="margin-bottom: 1.5rem">Customize variables like trip name and balance.</p>
                    <button class="btn btn-primary" onclick="showAddTemplateModal()">NEW TEMPLATE</button>
                </div>
            </div>
        </div>
    `;
}

async function handleSaveSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await api.updateSettings(data);
    localStorage.setItem('settings', JSON.stringify(data));
    alert('Settings saved!');
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
}

function loadSettings() {
    const s = JSON.parse(localStorage.getItem('settings') || '{"theme":"system"}');
    applyTheme(s.theme);
}

// --- ABOUT VIEW ---
function renderAboutView(container) {
    container.innerHTML = `
        <header>
            <div>
                <p class="text-muted" style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem">RESOURCES</p>
                <h1>About TripSplit Pro</h1>
            </div>
        </header>
        <div class="card fade-in" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 4rem 2rem;">
            <div style="background: var(--primary-gradient); width: 100px; height: 100px; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: var(--shadow-lg);">
                <i class="fas fa-paper-plane" style="color: white; font-size: 3rem"></i>
            </div>
            <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem;">TripSplit Pro <span style="color: var(--primary)">v2.2</span></h2>
            <p class="text-muted" style="font-size: 1.1rem; max-width: 500px; margin: 0 auto 3rem;">The ultimate premium expense splitting tool for travel groups.</p>
            
            <div class="grid" style="text-align: left; gap: 1.5rem; margin-bottom: 3rem;">
                <div class="card" style="background: var(--bg-main); border: 1px solid var(--border)">
                    <h4 style="margin-bottom: 1rem;"><i class="fas fa-wand-magic-sparkles" style="color: var(--primary); margin-right: 10px;"></i> Premium Interface</h4>
                    <p class="text-muted" style="font-size: 0.85rem;">Glassmorphism and GSAP animations for a state-of-the-art SaaS feel.</p>
                </div>
                <div class="card" style="background: var(--bg-main); border: 1px solid var(--border)">
                    <h4 style="margin-bottom: 1rem;"><i class="fab fa-whatsapp" style="color: #25D366; margin-right: 10px;"></i> WhatsApp Ready</h4>
                    <p class="text-muted" style="font-size: 0.85rem;">One-click summaries sent directly to your travel companions.</p>
                </div>
            </div>

            <div style="text-align: left;">
                <details style="cursor: pointer; background: var(--bg-main); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border);">
                    <summary style="font-weight: 800; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center;">
                        Changelog History v2.2
                        <i class="fas fa-chevron-down"></i>
                    </summary>
                    <div style="padding-top: 1.5rem;">
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Premium Dashboard UI Overhaul</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Member Photo and WhatsApp Integration</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Date-wise Expense Filtering Explorer</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> WhatsApp Bulk Messaging Module</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Custom Message Template Manager</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Dynamic Theme & Timezone Settings</li>
                            <li style="margin-bottom: 0.75rem;"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 10px;"></i> Robust Split Engine & Balance Sheet</li>
                        </ul>
                    </div>
                </details>
            </div>
        </div>
    `;
}

// --- HELPERS ---
function formatCurrency(amount) {
    const s = JSON.parse(localStorage.getItem('settings') || '{"currency":"INR ₹"}');
    const symbol = s.currency ? s.currency.split(' ')[1] : '₹';
    return `${symbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

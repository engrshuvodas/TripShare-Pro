/**
 * TripSplit Pro - Core Logic & State Management
 * Handles Data Persistence, View Navigation, and UI Updates
 */

class Store {
    constructor() {
        this.storageKey = 'tripsplit_pro_data';
        this.data = this.load();
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        const defaultData = {
            members: [
                { id: 'm1', name: 'Shuvo', whatsapp: '8801765245872', photo: '' },
                { id: 'm2', name: 'Promita', whatsapp: '8801912790430', photo: '' },
                { id: 'm3', name: 'Monami', whatsapp: '917044528716', photo: '' },
                { id: 'm4', name: 'Setu', whatsapp: '919933493538', photo: '' },
                { id: 'm5', name: 'Arpita', whatsapp: '8801923701861', photo: '' },
                { id: 'm6', name: 'Dipanjon', whatsapp: '918016370668', photo: '' },
                { id: 'm7', name: 'Srijan', whatsapp: '8801643116647', photo: '' }
            ],
            trips: [],
            expenses: [],
            settings: {
                theme: 'system',
                currency: 'INR',
                timezone: 'Asia/Kolkata'
            },
            templates: [
                { id: 'default', name: 'Standard Summary', body: 'Trip: {trip_name}\nMember: {member_name}\nTotal Trip Exp: {total}\nYour Share: {amount}' }
            ],
            currentTripId: null
        };

        if (!saved) return defaultData;

        const data = JSON.parse(saved);
        // If the user has data but absolutely NO members, inject the default list
        if (!data.members || data.members.length === 0) {
            data.members = defaultData.members;
        }
        return data;
    }

    resetToDefaults() {
        const defaultData = {
            members: [
                { id: 'm1', name: 'Shuvo', whatsapp: '8801765245872', photo: '' },
                { id: 'm2', name: 'Promita', whatsapp: '8801912790430', photo: '' },
                { id: 'm3', name: 'Monami', whatsapp: '917044528716', photo: '' },
                { id: 'm4', name: 'Setu', whatsapp: '919933493538', photo: '' },
                { id: 'm5', name: 'Arpita', whatsapp: '8801923701861', photo: '' },
                { id: 'm6', name: 'Dipanjon', whatsapp: '918016370668', photo: '' },
                { id: 'm7', name: 'Srijan', whatsapp: '8801643116647', photo: '' }
            ],
            // other defaults are optional here
        };
        this.data.members = defaultData.members;
        this.save();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // Member Methods
    addMember(member) {
        const newMember = { ...member, id: Date.now().toString() };
        this.data.members.push(newMember);
        this.save();
        return newMember;
    }

    getMembers() {
        return this.data.members;
    }

    updateMember(id, updatedMember) {
        const index = this.data.members.findIndex(m => m.id === id);
        if (index !== -1) {
            this.data.members[index] = { ...this.data.members[index], ...updatedMember };
            this.save();
        }
    }

    deleteMember(id) {
        this.data.members = this.data.members.filter(m => m.id !== id);
        this.save();
    }

    // Trip Methods
    createTrip(trip) {
        const newTrip = {
            ...trip,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        this.data.trips.push(newTrip);
        this.data.currentTripId = newTrip.id;
        this.save();
        return newTrip;
    }

    deleteTrip(id) {
        this.data.trips = this.data.trips.filter(t => t.id !== id);
        this.data.expenses = this.data.expenses.filter(e => e.tripId !== id);
        if (this.data.currentTripId === id) this.data.currentTripId = null;
        this.save();
    }

    getCurrentTrip() {
        return this.data.trips.find(t => t.id === this.data.currentTripId);
    }

    // Expense Methods
    addExpense(expense) {
        const newExpense = { ...expense, id: Date.now().toString() };
        this.data.expenses.push(newExpense);
        this.save();
        return newExpense;
    }

    getTripExpenses(tripId) {
        return this.data.expenses.filter(e => e.tripId === tripId);
    }

    getExpense(id) {
        return this.data.expenses.find(e => e.id === id);
    }

    deleteExpense(id) {
        this.data.expenses = this.data.expenses.filter(e => e.id !== id);
        this.save();
    }

    // Template Methods
    addTemplate(template) {
        const newTemplate = { ...template, id: Date.now().toString() };
        this.data.templates.push(newTemplate);
        this.save();
        return newTemplate;
    }

    updateTemplate(id, updatedTemplate) {
        const index = this.data.templates.findIndex(t => t.id === id);
        if (index !== -1) {
            this.data.templates[index] = { ...this.data.templates[index], ...updatedTemplate };
            this.save();
        }
    }

    deleteTemplate(id) {
        this.data.templates = this.data.templates.filter(t => t.id !== id);
        this.save();
    }

    // Settings
    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.save();
    }
}

const UI = {
    views: ['view-loading', 'view-trip-creation', 'view-dashboard', 'view-members', 'view-settings'],

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.route();
    },

    setupEventListeners() {
        // Navigation (Sidebar & Pills)
        document.querySelectorAll('[data-view-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.viewTarget;
                this.showView(`view-${target}`);
                this.updateActiveNav(e.currentTarget);
                window.location.hash = target;

                // Set View Title
                const titleMap = { dashboard: 'Dashboard', members: 'Trip Members', settings: 'App Settings' };
                document.getElementById('view-title').textContent = titleMap[target] || 'TripSplit Pro';

                // Close sidebar on mobile after navigation
                this.closeSidebar();
            });
        });

        // Sidebar Toggle (Mobile)
        document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());

        // Demo Member Loader
        const loadDemoBtn = document.getElementById('load-demo-btn');
        if (loadDemoBtn) {
            loadDemoBtn.addEventListener('click', () => {
                store.resetToDefaults();
                this.renderMemberSelection();
                this.showToast('Demo members loaded!');
            });
        }

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next);
            store.updateSettings({ theme: next });
        });

        // System Theme Change Observer
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (store.data.settings.theme === 'system') this.applyTheme();
        });

        // About Dropdown
        const setupAbout = (triggerId) => {
            const trigger = document.getElementById(triggerId);
            if (!trigger) return;
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('about-menu').classList.toggle('hidden');
            });
        };
        setupAbout('about-trigger');
        setupAbout('about-trigger-sidebar');

        document.addEventListener('click', () => {
            document.getElementById('about-menu').classList.add('hidden');
        });

        // Modal Close
        document.getElementById('modal-close').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-container').addEventListener('click', (e) => {
            if (e.target.id === 'modal-container') this.hideModal();
        });

        // Trip Form
        const tripForm = document.getElementById('trip-form');
        if (tripForm) {
            tripForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTripCreation();
            });
        }

        // Add Member/Expense Triggers
        document.getElementById('add-member-trigger').addEventListener('click', () => this.showMemberModal());
        document.getElementById('add-member-management').addEventListener('click', () => this.showMemberModal());

        const addExpenseHandler = () => this.showExpenseModal();
        document.getElementById('add-expense-trigger').addEventListener('click', addExpenseHandler);
        document.getElementById('add-expense-trigger-sidebar').addEventListener('click', addExpenseHandler);

        document.getElementById('send-whatsapp-summary').addEventListener('click', () => this.handleWhatsAppSummary());

        // Settings Listeners
        document.getElementById('settings-theme').addEventListener('change', (e) => {
            store.updateSettings({ theme: e.target.value });
            this.applyTheme();
        });

        document.getElementById('settings-currency').addEventListener('change', (e) => {
            store.updateSettings({ currency: e.target.value });
            this.renderDashboard();
        });

        document.getElementById('settings-timezone').addEventListener('change', (e) => {
            store.updateSettings({ timezone: e.target.value });
            this.showToast('Timezone updated');
        });

        document.getElementById('add-template-trigger').addEventListener('click', () => this.showTemplateModal());
    },

    route() {
        const trip = store.getCurrentTrip();
        const hash = window.location.hash.replace('#', '');
        const validViews = ['dashboard', 'members', 'settings'];
        const activeView = validViews.includes(hash) ? hash : 'dashboard';

        if (!trip) {
            this.showView('view-trip-creation');
            this.renderMemberSelection();
        } else {
            this.showView(`view-${activeView}`);
            const navBtn = document.querySelector(`[data-view-target="${activeView}"]`);
            if (navBtn) this.updateActiveNav(navBtn);

            if (activeView === 'dashboard') this.renderDashboard();
            if (activeView === 'members') this.renderMembersManagement();
            if (activeView === 'settings') this.renderSettings();

            document.getElementById('view-title').textContent = activeView.charAt(0).toUpperCase() + activeView.slice(1);
        }
    },

    showView(viewId) {
        this.views.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('animate-in');
            }
        });
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            // Force reflow for animation
            void target.offsetWidth;
            target.classList.add('animate-in');
        }
    },

    updateActiveNav(activeBtn) {
        document.querySelectorAll('.nav-pill').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    },

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    },

    applyTheme() {
        const theme = store.data.settings.theme;
        let activeTheme = theme;
        if (theme === 'system') {
            activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.setTheme(activeTheme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#theme-toggle .icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },

    // Modal Helpers
    showModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        document.getElementById('modal-container').classList.remove('hidden');
    },

    hideModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    // View Renders & Actions
    renderMemberSelection() {
        const container = document.getElementById('member-selection-list');
        const demoContainer = document.getElementById('demo-load-container');
        const members = store.getMembers();

        if (members.length === 0) {
            container.innerHTML = `
                <div class="col-span-full p-lg glass text-center" style="border-radius: var(--radius-md)">
                    <p class="text-secondary text-sm">No members added yet. Create some to start splitting!</p>
                </div>
            `;
            if (demoContainer) demoContainer.classList.remove('hidden');
            return;
        }

        if (demoContainer) demoContainer.classList.add('hidden');
        container.innerHTML = members.map(m => `
            <div class="member-chip">
                <input type="checkbox" id="m-${m.id}" value="${m.id}" name="members" checked>
                <label for="m-${m.id}">
                    ${m.photo ? `<img src="${m.photo}" class="chip-avatar">` : '<div class="chip-avatar flex-center bg-surface">👤</div>'}
                    <span class="text-xs font-bold">${m.name}</span>
                </label>
            </div>
        `).join('');
    },

    showMemberModal() {
        const html = `
            <form id="member-form" class="flex-col gap-lg">
                <div class="form-group">
                    <label>Member Name</label>
                    <input type="text" id="m-name" required placeholder="e.g. Alex Graham">
                </div>
                <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" id="m-phone" required placeholder="e.g. 919876543210">
                </div>
                <div class="form-group">
                    <label>Profile Photo</label>
                    <input type="file" id="m-photo" accept="image/*" class="text-xs">
                    <div id="photo-preview" class="mt-sm flex-center"></div>
                </div>
                <button type="submit" class="btn-primary w-full py-md mt-md">✨ Save Member</button>
            </form>
        `;
        this.showModal('Add New Member', html);

        const form = document.getElementById('member-form');
        const photoInput = document.getElementById('m-photo');
        let base64Photo = '';

        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    base64Photo = re.target.result;
                    document.getElementById('photo-preview').innerHTML = `<img src="${base64Photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('m-name').value;
            const phone = document.getElementById('m-phone').value;
            store.addMember({ name, whatsapp: phone, photo: base64Photo });
            this.hideModal();
            this.renderMemberSelection();
            this.showToast('Member added successfully!');
        });
    },

    handleTripCreation() {
        const name = document.getElementById('trip-name').value;
        const location = document.getElementById('trip-location').value;
        const startDate = document.getElementById('trip-start').value;
        const endDate = document.getElementById('trip-end').value;
        const selectedMembers = Array.from(document.querySelectorAll('input[name="members"]:checked')).map(cb => cb.value);

        if (selectedMembers.length === 0) {
            this.showToast('Please select at least one member!', 'error');
            return;
        }

        store.createTrip({ name, location, startDate, endDate, memberIds: selectedMembers });
        this.showToast('Trip created successfully!');
        this.route();
    },

    renderDashboard() {
        const trip = store.getCurrentTrip();
        if (!trip) return;

        const currency = store.data.settings.currency === 'INR' ? '₹' : (store.data.settings.currency === 'USD' ? '$' : '€');
        const start = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
        const end = trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

        // Update Stat Cards
        const expenses = store.getTripExpenses(trip.id);
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const share = trip.memberIds.length > 0 ? total / trip.memberIds.length : 0;

        document.getElementById('total-trip-cost').textContent = `${currency}${total.toLocaleString()}`;
        document.getElementById('per-person-share').textContent = `${currency}${share.toLocaleString()}`;
        document.getElementById('member-count').textContent = trip.memberIds.length;
        document.getElementById('dashboard-trip-location').textContent = `${trip.location} • ${start} - ${end}`;

        // Month for chart
        const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        document.getElementById('chart-month').textContent = currentMonth;

        this.renderSpendingChart(expenses, currency);
        this.renderExpenseList(expenses, currency);
        this.renderMemberBreakdown(trip, expenses, currency);
    },

    renderSpendingChart(expenses, currency) {
        const container = document.getElementById('spending-chart');
        if (expenses.length === 0) {
            container.innerHTML = '<div class="flex-center w-full py-xl text-muted">No data to display</div>';
            return;
        }

        // Group expenses by date (last 7 days or all trip days)
        const dailyData = {};
        expenses.forEach(exp => {
            const dateStr = new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            dailyData[dateStr] = (dailyData[dateStr] || 0) + parseFloat(exp.amount);
        });

        const dates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
        const maxAmount = Math.max(...Object.values(dailyData), 100);

        container.innerHTML = dates.map(date => {
            const amount = dailyData[date];
            const height = (amount / maxAmount) * 100;
            return `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${height}%"></div>
                    <div class="chart-tooltip">${currency}${amount.toLocaleString()}</div>
                    <div class="chart-bar-label">${date}</div>
                </div>
            `;
        }).join('');
    },

    renderExpenseList(expenses, currency) {
        const container = document.getElementById('expense-list');
        if (expenses.length === 0) {
            container.innerHTML = '<div class="card glass text-center py-xl">No expenses yet.</div>';
            return;
        }

        const grouped = expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
            .reduce((acc, exp) => {
                const date = new Date(exp.date).toLocaleDateString('en-IN', { dateStyle: 'long' });
                if (!acc[date]) acc[date] = [];
                acc[date].push(exp);
                return acc;
            }, {});

        container.innerHTML = Object.entries(grouped).map(([date, items]) => `
            <div class="expense-group mb-lg">
                <div class="text-xs text-muted mb-sm uppercase font-bold tracking-wider">${date}</div>
                <div class="flex-col gap-sm">
                    ${items.map(exp => {
            const payer = store.getMembers().find(m => m.id === exp.paidBy);
            const title = exp.title.toLowerCase();
            let icon = '💸';
            if (title.includes('food') || title.includes('eat') || title.includes('dinner')) icon = '🍔';
            if (title.includes('fuel') || title.includes('petrol') || title.includes('gas')) icon = '⛽';
            if (title.includes('hotel') || title.includes('stay') || title.includes('room')) icon = '🏨';
            if (title.includes('ticket') || title.includes('flight') || title.includes('train')) icon = '🎫';
            if (title.includes('drink') || title.includes('beer') || title.includes('bar')) icon = '🍻';

            return `
                            <div class="card glass animate-in p-md flex-between" style="cursor: pointer;" onclick="UI.showExpenseDetailModal('${exp.id}')">
                                <div class="flex-center gap-md">
                                    <div class="avatar-sm flex-center">${icon}</div>
                                    <div>
                                        <strong class="block text-sm">${exp.title}</strong>
                                        <span class="text-xs text-secondary">Paid by ${payer ? payer.name : 'Unknown'}</span>
                                    </div>
                                </div>
                                <div class="text-sm font-bold gradient-text">${currency}${parseFloat(exp.amount).toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
    },

    renderMemberBreakdown(trip, expenses, currency) {
        const container = document.getElementById('member-breakdown');
        const members = store.getMembers().filter(m => trip.memberIds.includes(m.id));

        const totals = members.map(m => {
            const paid = expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + parseFloat(e.amount), 0);
            let share = 0;
            expenses.forEach(e => {
                if (e.splitBetweenIds.includes(m.id)) {
                    share += parseFloat(e.amount) / e.splitBetweenIds.length;
                }
            });
            return { ...m, paid, share, balance: paid - share };
        });

        container.innerHTML = totals.map(t => `
            <div class="card glass mb-sm p-md flex-between">
                <div class="flex-center gap-md">
                    ${t.photo ? `<img src="${t.photo}" class="avatar-sm">` : '<div class="avatar-sm flex-center">👤</div>'}
                    <div>
                        <strong class="block text-sm">${t.name}</strong>
                        <p class="text-xs text-secondary">Paid: ${currency}${t.paid.toFixed(0)}</p>
                    </div>
                </div>
                <div class="text-sm font-bold ${t.balance >= 0 ? 'text-success' : 'text-danger'}">
                    ${t.balance >= 0 ? '+' : ''}${currency}${t.balance.toFixed(0)}
                </div>
            </div>
        `).join('');
    },

    showExpenseModal() {
        const trip = store.getCurrentTrip();
        const members = store.getMembers().filter(m => trip.memberIds.includes(m.id));

        const html = `
            <form id="expense-form">
                <div class="form-group">
                    <label>Expense Title</label>
                    <input type="text" id="exp-title" required placeholder="e.g. Dinner at Beach">
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" id="exp-amount" required placeholder="0.00" step="0.01">
                </div>
                <div class="form-group">
                    <label>Paid By</label>
                    <select id="exp-payer" required>
                        ${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Split Between</label>
                    <div class="flex-col gap-sm mt-sm">
                        ${members.map(m => `
                            <label class="flex-between" style="font-weight: 400">
                                <span>${m.name}</span>
                                <input type="checkbox" name="exp-split" value="${m.id}" checked>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <button type="submit" class="btn-primary w-full mt-lg">Add Expense</button>
            </form>
        `;
        this.showModal('Add New Expense', html);

        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('exp-title').value;
            const amount = document.getElementById('exp-amount').value;
            const paidBy = document.getElementById('exp-payer').value;
            const splitBetweenIds = Array.from(document.querySelectorAll('input[name="exp-split"]:checked')).map(cb => cb.value);

            if (splitBetweenIds.length === 0) {
                this.showToast('Please select at least one person to split with!', 'error');
                return;
            }

            store.addExpense({
                tripId: trip.id,
                title,
                amount,
                paidBy,
                splitBetweenIds,
                date: new Date().toISOString()
            });

            this.hideModal();
            this.renderDashboard();
            this.showToast('Expense added!');
        });
    },

    handleWhatsAppSummary() {
        const trip = store.getCurrentTrip();
        const expenses = store.getTripExpenses(trip.id);
        const members = store.getMembers().filter(m => trip.memberIds.includes(m.id));
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        const html = `
            <div class="form-group">
                <label>Select Template</label>
                <select id="wa-template-select">
                    ${store.data.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
            </div>
            <p class="text-secondary mb-md">Select a member to send their specific summary.</p>
            <div class="flex-col gap-sm" id="wa-member-list">
                ${members.map(m => {
            const paid = expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + parseFloat(e.amount), 0);
            let share = 0;
            expenses.forEach(e => {
                if (e.splitBetweenIds.includes(m.id)) {
                    share += parseFloat(e.amount) / e.splitBetweenIds.length;
                }
            });
            const balance = paid - share;
            return `
                        <button class="btn-secondary w-full flex-between p-md" onclick="UI.sendSpecificWhatsApp('${m.id}', '${balance.toFixed(0)}', '${share.toFixed(0)}')">
                            <span>${m.name}</span>
                            <span class="${balance >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: 700">${balance >= 0 ? '+' : ''}${balance.toFixed(0)}</span>
                        </button>
                    `;
        }).join('')}
            </div>
        `;
        this.showModal('Send WhatsApp Summary', html);
    },

    sendSpecificWhatsApp(memberId, balanceVal, shareVal) {
        const trip = store.getCurrentTrip();
        const expenses = store.getTripExpenses(trip.id);
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const member = store.getMembers().find(m => m.id === memberId);
        const templateId = document.getElementById('wa-template-select').value;
        const template = store.data.templates.find(t => t.id === templateId).body;

        const message = template
            .replace('{trip_name}', trip.name)
            .replace('{member_name}', member.name)
            .replace('{total}', total.toFixed(0))
            .replace('{amount}', shareVal);

        window.open(`https://wa.me/${member.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    },

    showExpenseDetailModal(expenseId) {
        const exp = store.getExpense(expenseId);
        if (!exp) return;

        const payer = store.getMembers().find(m => m.id === exp.paidBy);
        const splitMembers = store.getMembers().filter(m => exp.splitBetweenIds.includes(m.id));
        const currency = store.data.settings.currency === 'INR' ? '₹' : (store.data.settings.currency === 'USD' ? '$' : '€');
        const share = parseFloat(exp.amount) / exp.splitBetweenIds.length;

        const html = `
            <div class="expense-details">
                <div class="flex-between mb-lg">
                    <div>
                        <h2 class="h3">${exp.title}</h2>
                        <span class="text-secondary">${new Date(exp.date).toLocaleString()}</span>
                    </div>
                    <div class="h2 text-primary">${currency}${parseFloat(exp.amount).toLocaleString()}</div>
                </div>
                <div class="detail-label text-secondary mb-xs">Paid By</div>
                <div class="flex-center gap-md mb-lg">
                    ${payer?.photo ? `<img src="${payer.photo}" class="avatar-sm">` : '👤'}
                    <strong>${payer ? payer.name : 'Unknown'}</strong>
                </div>
                <div class="detail-label text-secondary mb-xs">Split Between (${exp.splitBetweenIds.length} members)</div>
                <div class="flex-col gap-sm mb-xl">
                    ${splitMembers.map(m => `
                        <div class="flex-between p-sm glass" style="border-radius: var(--radius-sm)">
                            <div class="flex-center gap-sm">
                                ${m.photo ? `<img src="${m.photo}" style="width: 24px; height: 24px; border-radius: 50%;">` : '👤'}
                                <span>${m.name}</span>
                            </div>
                            <span>${currency}${share.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-outline w-full text-danger border-danger" onclick="UI.handleDeleteExpense('${exp.id}')">Delete Expense</button>
            </div>
        `;
        this.showModal('Expense Details', html);
    },

    handleDeleteExpense(id) {
        if (confirm('Delete this expense?')) {
            store.deleteExpense(id);
            this.hideModal();
            this.renderDashboard();
            this.showToast('Expense deleted');
        }
    },

    renderMembersManagement() {
        const container = document.getElementById('members-list');
        const demoContainer = document.getElementById('members-demo-load');
        const members = store.getMembers();

        if (members.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex-center flex-col text-center py-xl animate-in" style="min-height: 40vh">
                    <div class="glass p-lg mb-lg flex-center" style="border-radius: 50%; width: 80px; height: 80px; font-size: 2rem">👥</div>
                    <h3 class="h3 mb-sm">No Members Yet</h3>
                    <p class="text-secondary text-sm max-w-xs mb-lg">Add your travel buddies to start splitting expenses with them.</p>
                </div>
            `;
            if (demoContainer) demoContainer.classList.remove('hidden');
            return;
        }

        if (demoContainer) demoContainer.classList.add('hidden');
        container.innerHTML = members.map(m => `
            <div class="card glass animate-in flex-between p-md" style="border-radius: var(--radius-md)">
                <div class="flex-center gap-md" style="cursor: pointer;" onclick="UI.showEditMemberModal('${m.id}')">
                    ${m.photo ? `<img src="${m.photo}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : '<div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--glass-border)" class="flex-center">👤</div>'}
                    <div>
                        <strong>${m.name}</strong>
                        <p class="text-secondary" style="font-size: 0.75rem">${m.whatsapp}</p>
                    </div>
                </div>
                <div class="flex-center gap-sm">
                    <button class="btn-icon" onclick="UI.showEditMemberModal('${m.id}')">✏️</button>
                    <button class="btn-icon" onclick="UI.handleDeleteMember('${m.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    handleLoadDemoMembers() {
        if (confirm('Load the default demo member list? This will add 7 members to your list.')) {
            store.resetToDefaults();
            this.renderMemberSelection();
            this.renderMembersManagement();
            this.showToast('Default members loaded!');
        }
    },

    showEditMemberModal(id) {
        const member = store.getMembers().find(m => m.id === id);
        if (!member) return;

        const html = `
            <form id="edit-member-form">
                <div class="form-group">
                    <label>Member Name</label>
                    <input type="text" id="edit-m-name" required value="${member.name}">
                </div>
                <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" id="edit-m-phone" required value="${member.whatsapp}">
                </div>
                <div class="form-group">
                    <label>Photo</label>
                    <input type="file" id="edit-m-photo" accept="image/*">
                    <div id="edit-photo-preview" class="mt-sm">
                        ${member.photo ? `<img src="${member.photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">` : ''}
                    </div>
                </div>
                <button type="submit" class="btn-primary w-full mt-md">Update Member</button>
            </form>
        `;
        this.showModal('Edit Member', html);

        let newPhoto = member.photo;
        document.getElementById('edit-m-photo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    newPhoto = re.target.result;
                    document.getElementById('edit-photo-preview').innerHTML = `<img src="${newPhoto}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('edit-member-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-m-name').value;
            const phone = document.getElementById('edit-m-phone').value;
            store.updateMember(id, { name, whatsapp: phone, photo: newPhoto });
            this.hideModal();
            this.renderMembersManagement();
            this.showToast('Member updated');
        });
    },

    handleDeleteMember(id) {
        const member = store.getMembers().find(m => m.id === id);
        if (!member) return;

        if (confirm(`Are you sure you want to remove ${member.name}? This will not delete their existing expenses but they will no longer be selectable for new ones.`)) {
            store.deleteMember(id);
            this.renderMembersManagement();
            this.showToast(`${member.name} removed`);
        }
    },

    renderTemplatesManagement() {
        const container = document.getElementById('templates-list');
        const templates = store.data.templates;

        container.innerHTML = templates.map(t => `
            <div class="glass p-md mb-md flex-between" style="border-radius: var(--radius-md)">
                <div>
                    <strong>${t.name}</strong>
                    <p class="text-secondary" style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${t.body}</p>
                </div>
                <div class="flex-center gap-sm">
                    <button class="btn-icon" onclick="UI.showTemplateModal('${t.id}')">✏️</button>
                    ${t.id !== 'default' ? `<button class="btn-icon" onclick="UI.handleDeleteTemplate('${t.id}')">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');
    },

    showTemplateModal(templateId = null) {
        const template = templateId ? store.data.templates.find(t => t.id === templateId) : { name: '', body: '' };

        const html = `
            <form id="template-form">
                <div class="form-group">
                    <label>Template Name</label>
                    <input type="text" id="tpl-name" required value="${template.name}" placeholder="e.g. Simple Summary">
                </div>
                <div class="form-group">
                    <label>Message Body</label>
                    <textarea id="tpl-body" required rows="6" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--surface); border: 1px solid var(--glass-border); width: 100%; color: var(--text-main); font-family: inherit;">${template.body}</textarea>
                    <div class="text-muted mt-sm" style="font-size: 0.75rem">
                        Variables: {trip_name}, {member_name}, {amount}, {total}
                    </div>
                </div>
                <button type="submit" class="btn-primary w-full mt-md">${templateId ? 'Update' : 'Create'} Template</button>
            </form>
        `;
        this.showModal(templateId ? 'Edit Template' : 'Create Template', html);

        document.getElementById('template-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('tpl-name').value;
            const body = document.getElementById('tpl-body').value;

            if (templateId) {
                store.updateTemplate(templateId, { name, body });
            } else {
                store.addTemplate({ name, body });
            }

            this.hideModal();
            this.renderTemplatesManagement();
            this.showToast('Template saved');
        });
    },

    handleDeleteTemplate(id) {
        if (confirm('Delete this template?')) {
            store.deleteTemplate(id);
            this.renderTemplatesManagement();
            this.showToast('Template deleted');
        }
    },

    renderSettings() {
        const settings = store.data.settings;
        document.getElementById('settings-theme').value = settings.theme;
        document.getElementById('settings-currency').value = settings.currency;
        const tzSelect = document.getElementById('settings-timezone');
        if (tzSelect) tzSelect.value = settings.timezone || 'Asia/Kolkata';

        this.renderTemplatesManagement();
    },

    renderDashboard() {
        const trip = store.getCurrentTrip();
        if (!trip) {
            document.getElementById('app-content').innerHTML = `
                <div class="flex-center flex-col text-center py-xl animate-in" style="min-height: 60vh">
                    <div class="glass p-xl mb-xl flex-center" style="border-radius: 50%; width: 120px; height: 120px; font-size: 3rem">✈️</div>
                    <h2 class="h2 mb-md">Welcome to TripSplit Pro!</h2>
                    <p class="text-secondary max-w-sm mb-xl">Your adventure starts here. Create a trip to track expenses, split costs with friends, and see where your money goes.</p>
                    <button class="btn-primary py-lg px-xl" onclick="UI.showView('view-trip-creation')">✨ Create Your First Trip</button>
                    <div class="mt-xl pt-lg border-top w-full max-w-sm">
                        <button class="btn-outline w-full text-xs" onclick="UI.handleLoadDemoMembers()">📦 Or load demo data to explore</button>
                    </div>
                </div>
            `;
            return;
        }

        // Restore original content if it was overwritten
        const dashboardHtml = `
            <div id="view-dashboard" class="view animate-in">
                <div class="flex-col gap-xl">
                    <div class="grid-2 gap-xl">
                        <div class="card stat-card float gradient-1 p-xl animate-scale-up">
                            <span class="text-sm uppercase opacity-80">Total Trip Expense</span>
                            <h3 class="h1 mt-sm" id="total-trip-cost">₹0</h3>
                            <div class="mt-md text-xs" id="dashboard-trip-location">---</div>
                        </div>
                        <div class="card stat-card float glass p-xl animate-scale-up">
                            <div class="flex-between">
                                <div>
                                    <span class="text-sm uppercase text-secondary">Per Person Share</span>
                                    <h3 class="h2 mt-sm" id="per-person-share">₹0</h3>
                                    <span class="text-xs text-muted mt-xs block">Equal division active</span>
                                </div>
                                <div class="h3 gradient-text" id="member-count">0</div>
                            </div>
                        </div>
                    </div>
                    <div class="card glass p-xl">
                        <div class="flex-between mb-xl">
                            <h3 class="h4">Daily Spending Trend</h3>
                            <span class="badge text-xs" id="chart-month">---</span>
                        </div>
                        <div class="chart-container" id="spending-chart"></div>
                    </div>
                    <div class="grid-2 gap-xl items-start">
                        <div class="expense-records">
                            <div class="flex-between mb-lg">
                                <h3 class="h4">Expense Records</h3>
                                <button class="btn-secondary text-xs py-xs px-md" onclick="UI.showExpenseModal()">Add New</button>
                            </div>
                            <div id="expense-list" class="flex-col gap-md"></div>
                        </div>
                        <div class="settlement-summary">
                            <div class="flex-between mb-lg">
                                <h3 class="h4">Settlement Summary</h3>
                                <button class="btn-outline text-xs py-xs px-md" onclick="UI.handleWhatsAppSummary()">Send WhatsApp</button>
                            </div>
                            <div id="member-breakdown" class="flex-col gap-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('app-content').innerHTML = dashboardHtml;

        const expenses = store.getTripExpenses(trip.id);
        const currency = store.data.settings.currency === 'INR' ? '₹' : (store.data.settings.currency === 'USD' ? '$' : '€');
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        document.getElementById('total-trip-cost').textContent = `${currency}${total.toLocaleString()}`;
        document.getElementById('dashboard-trip-location').textContent = trip.location;
        document.getElementById('member-count').textContent = trip.memberIds.length;
        document.getElementById('per-person-share').textContent = `${currency}${trip.memberIds.length ? (total / trip.memberIds.length).toLocaleString() : 0}`;
        document.getElementById('chart-month').textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        this.renderSpendingChart(expenses, currency);
        this.renderExpenseList(expenses, currency);
        this.renderMemberBreakdown(trip, expenses, currency);
    },

    handleResetTrip() {
        if (confirm('Are you absolutely sure? This will delete the current trip and all its expenses.')) {
            const trip = store.getCurrentTrip();
            if (trip) {
                store.deleteTrip(trip.id);
                this.showToast('Trip deleted successfully');
                window.location.hash = '';
                this.route();
            }
        }
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast glass animate-slide-up ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize App
const store = new Store();
UI.init();

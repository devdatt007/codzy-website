/* ============================================
   CODZY — Admin Dashboard JS
   ============================================ */

const API = '/api/admin';

/* ── DOM refs ── */
const dashboard = document.getElementById('adminDashboard');
const logoutBtn = document.getElementById('adminLogoutBtn');
const refreshBtn = document.getElementById('refreshData');
const pageTitle = document.getElementById('adminPageTitle');

/* ── Tab switching ── */
document.querySelectorAll('.admin-nav-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;

        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        const titles = {
            overview: 'Dashboard Overview',
            contacts: 'Contact Messages',
            newsletter: 'Newsletter Subscribers',
            users: 'Registered Users',
            orders: 'Orders',
        };
        pageTitle.textContent = titles[tab] || 'Dashboard';
    });
});

/* ── Check session on load ── */
async function checkSession() {
    try {
        const res = await fetch(`${API}/check`);
        const data = await res.json();
        if (data.isAdmin) {
            showDashboard();
        } else {
            // Not authenticated — redirect to login
            window.location.href = '/login';
        }
    } catch (e) {
        // Error checking session — redirect to login
        window.location.href = '/login';
    }
}

/* ── Logout ── */
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch(`${API}/logout`, { method: 'POST' });
    window.location.href = '/login';
});

/* ── Show dashboard ── */
function showDashboard() {
    dashboard.style.display = 'flex';
    loadAllData();
}

/* ── Refresh ── */
refreshBtn.addEventListener('click', loadAllData);

/* ── Load all data ── */
async function loadAllData() {
    await Promise.all([
        loadStats(),
        loadContacts(),
        loadNewsletter(),
        loadUsers(),
        loadOrders(),
    ]);
}

/* ── Helper: format date ── */
function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/* ── Load Stats ── */
async function loadStats() {
    try {
        const res = await fetch(`${API}/stats`);
        const data = await res.json();
        if (data.success) {
            document.getElementById('statContacts').textContent = data.stats.contacts;
            document.getElementById('statSubscribers').textContent = data.stats.subscribers;
            document.getElementById('statUsers').textContent = data.stats.users;
            document.getElementById('statOrders').textContent = data.stats.orders;
            document.getElementById('statRevenue').textContent = `$${Number(data.stats.revenue).toFixed(2)}`;
        }
    } catch (e) { console.error('Stats error:', e); }
}

/* ── Load Contacts ── */
async function loadContacts() {
    try {
        const res = await fetch(`${API}/contacts`);
        const data = await res.json();
        const rows = data.data || [];

        if (rows.length === 0) {
            document.getElementById('contactsTable').innerHTML = '<p class="admin-empty">No contact messages yet.</p>';
            document.getElementById('overviewContacts').innerHTML = '<p class="admin-empty">No contact messages yet.</p>';
            return;
        }

        const buildTable = (items) => `
            <table class="admin-table">
                <thead><tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th></th>
                </tr></thead>
                <tbody>
                    ${items.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${esc(c.name)}</td>
                            <td><a href="mailto:${esc(c.email)}" style="color:var(--gold-primary)">${esc(c.email)}</a></td>
                            <td>${esc(c.subject || '—')}</td>
                            <td class="msg-cell" onclick="this.classList.toggle('expanded')" title="Click to expand">${esc(c.message)}</td>
                            <td style="white-space:nowrap">${fmtDate(c.created_at)}</td>
                            <td><button class="admin-delete-btn" onclick="deleteItem('contacts', ${c.id})">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('contactsTable').innerHTML = buildTable(rows);
        document.getElementById('overviewContacts').innerHTML = buildTable(rows.slice(0, 5));
    } catch (e) { console.error('Contacts error:', e); }
}

/* ── Load Newsletter ── */
async function loadNewsletter() {
    try {
        const res = await fetch(`${API}/newsletter`);
        const data = await res.json();
        const rows = data.data || [];

        if (rows.length === 0) {
            document.getElementById('newsletterTable').innerHTML = '<p class="admin-empty">No subscribers yet.</p>';
            return;
        }

        document.getElementById('newsletterTable').innerHTML = `
            <table class="admin-table">
                <thead><tr>
                    <th>ID</th><th>Email</th><th>Subscribed</th><th></th>
                </tr></thead>
                <tbody>
                    ${rows.map(s => `
                        <tr>
                            <td>${s.id}</td>
                            <td><a href="mailto:${esc(s.email)}" style="color:var(--gold-primary)">${esc(s.email)}</a></td>
                            <td style="white-space:nowrap">${fmtDate(s.subscribed_at)}</td>
                            <td><button class="admin-delete-btn" onclick="deleteItem('newsletter', ${s.id})">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) { console.error('Newsletter error:', e); }
}

/* ── Load Users ── */
async function loadUsers() {
    try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        const rows = data.data || [];

        if (rows.length === 0) {
            document.getElementById('usersTable').innerHTML = '<p class="admin-empty">No registered users yet.</p>';
            return;
        }

        document.getElementById('usersTable').innerHTML = `
            <table class="admin-table">
                <thead><tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Registered</th>
                </tr></thead>
                <tbody>
                    ${rows.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${esc(u.name)}</td>
                            <td><a href="mailto:${esc(u.email)}" style="color:var(--gold-primary)">${esc(u.email)}</a></td>
                            <td style="white-space:nowrap">${fmtDate(u.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) { console.error('Users error:', e); }
}

/* ── Load Orders ── */
async function loadOrders() {
    try {
        const res = await fetch(`${API}/orders`);
        const data = await res.json();
        const rows = data.data || [];

        if (rows.length === 0) {
            document.getElementById('ordersTable').innerHTML = '<p class="admin-empty">No orders yet.</p>';
            return;
        }

        document.getElementById('ordersTable').innerHTML = `
            <table class="admin-table">
                <thead><tr>
                    <th>ID</th><th>Customer</th><th>Email</th><th>Items</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Date</th>
                </tr></thead>
                <tbody>
                    ${rows.map(o => `
                        <tr>
                            <td>${o.id}</td>
                            <td>${esc(o.user_name || '—')}</td>
                            <td><a href="mailto:${esc(o.user_email || '')}" style="color:var(--gold-primary)">${esc(o.user_email || '—')}</a></td>
                            <td class="msg-cell" onclick="this.classList.toggle('expanded')" title="Click to expand">${esc(o.items)}</td>
                            <td>$${Number(o.subtotal).toFixed(2)}</td>
                            <td>$${Number(o.tax).toFixed(2)}</td>
                            <td style="font-weight:600;color:var(--gold-primary)">$${Number(o.total).toFixed(2)}</td>
                            <td style="white-space:nowrap">${fmtDate(o.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) { console.error('Orders error:', e); }
}

/* ── Delete item ── */
async function deleteItem(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type === 'newsletter' ? 'subscriber' : 'message'}?`)) return;

    try {
        const res = await fetch(`${API}/${type}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            loadAllData();
        }
    } catch (e) {
        alert('Delete failed');
    }
}

/* ── HTML escape ── */
function esc(str) {
    if (!str) return '';
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
}

/* ── Init ── */
checkSession();

/* ── Reset Database Modal ── */
(function () {
    const openBtn = document.getElementById('openResetBtn');
    const modal = document.getElementById('resetModal');
    const cancelBtn = document.getElementById('resetCancelBtn');
    const confirmBtn = document.getElementById('resetConfirmBtn');
    const phraseInput = document.getElementById('resetConfirmPhrase');
    const passInput = document.getElementById('resetAdminPass');
    const errorEl = document.getElementById('resetError');

    if (!openBtn || !modal) return;

    function closeModal() {
        modal.style.display = 'none';
        phraseInput.value = '';
        passInput.value = '';
        errorEl.textContent = '';
        confirmBtn.disabled = true;
    }

    function checkInputs() {
        const phraseOk = phraseInput.value === 'RESET ALL DATA';
        const passOk = passInput.value.length > 0;
        confirmBtn.disabled = !(phraseOk && passOk);
    }

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        phraseInput.focus();
    });

    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    phraseInput.addEventListener('input', checkInputs);
    passInput.addEventListener('input', checkInputs);

    confirmBtn.addEventListener('click', async () => {
        errorEl.textContent = '';
        confirmBtn.textContent = 'Resetting...';
        confirmBtn.disabled = true;

        try {
            const res = await fetch(`${API}/reset-database`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: passInput.value,
                    confirmPhrase: phraseInput.value,
                }),
            });
            const data = await res.json();

            if (data.success) {
                closeModal();
                loadAllData();
                alert('✅ Database has been completely reset.');
            } else {
                errorEl.textContent = data.message || 'Reset failed.';
            }
        } catch (err) {
            errorEl.textContent = 'Server error. Please try again.';
        } finally {
            confirmBtn.textContent = 'Delete Everything';
            checkInputs();
        }
    });
})();

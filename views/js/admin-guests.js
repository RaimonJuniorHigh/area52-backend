// ==========================================
// AREA52 ADMIN USERS (Guests + Admins)
// ==========================================

const AdminGuests = (() => {
    const API = '/api/admin/users';
    let currentFilter = 'all';
    let usersCache = [];
    let currentUserId = null;

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthUtils.getToken()}`,
        };
    }

    function showMessage(text, isError = false) {
        const el = document.getElementById('guest-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function roleLabel(role) {
        return role === 'admin'
            ? '<span class="admin-badge admin-badge--active">Admin</span>'
            : '<span class="admin-badge">Gast</span>';
    }

    function updateStats(users) {
        const guestEl = document.getElementById('guest-count');
        const adminEl = document.getElementById('admin-count');
        if (guestEl) guestEl.textContent = String(users.filter(u => u.role === 'guest').length);
        if (adminEl) adminEl.textContent = String(users.filter(u => u.role === 'admin').length);
    }

    function filteredUsers() {
        if (currentFilter === 'all') return usersCache;
        return usersCache.filter(u => u.role === currentFilter);
    }

    function updateFilterButtons() {
        document.querySelectorAll('#user-filters [data-filter]').forEach(btn => {
            const active = btn.dataset.filter === currentFilter;
            btn.classList.toggle('admin-btn--ghost', !active);
        });

        const titles = { all: 'Alle accounts', guest: 'Gastaccounts', admin: 'Adminaccounts' };
        const titleEl = document.getElementById('users-table-title');
        if (titleEl) titleEl.textContent = titles[currentFilter] || titles.all;
    }

    function renderActions(user) {
        const isSelf = user.id === currentUserId;
        if (isSelf) return '<span class="admin-text-muted">Jij</span>';

        const roleBtn = user.role === 'guest'
            ? `<button class="admin-btn admin-btn--sm" data-promote="${user.id}">Maak admin</button>`
            : `<button class="admin-btn admin-btn--sm" data-demote="${user.id}">Maak gast</button>`;

        return `
            <div class="bike-table__actions">
                ${roleBtn}
                <button class="admin-btn admin-btn--sm admin-btn--danger" data-delete="${user.id}">Verwijder</button>
            </div>
        `;
    }

    function renderTable() {
        const tbody = document.getElementById('guests-tbody');
        if (!tbody) return;

        const users = filteredUsers();
        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="4">Geen accounts gevonden.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr data-user-id="${user.id}">
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${roleLabel(user.role)}</td>
                <td>${renderActions(user)}</td>
            </tr>
        `).join('');
    }

    async function loadUsers() {
        const tbody = document.getElementById('guests-tbody');
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Laden mislukt');
            usersCache = data;
            updateStats(usersCache);
            updateFilterButtons();
            renderTable();
            showMessage('');
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
            showMessage(err.message, true);
        }
    }

    async function changeRole(userId, role) {
        const label = role === 'admin' ? 'promoveren naar admin' : 'terugzetten naar gast';
        if (!confirm(`Weet je zeker dat je dit account wilt ${label}?`)) return;

        try {
            const res = await fetch(`${API}/${userId}/role`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Wijzigen mislukt');
            showMessage(data.message);
            await loadUsers();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    async function deleteUser(userId) {
        if (!confirm('Weet je zeker dat je dit account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return;

        try {
            const res = await fetch(`${API}/${userId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verwijderen mislukt');
            showMessage(data.message);
            await loadUsers();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    function bindEvents() {
        document.getElementById('user-filters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            currentFilter = btn.dataset.filter;
            updateFilterButtons();
            renderTable();
        });

        document.getElementById('guests-tbody')?.addEventListener('click', (e) => {
            const promoteBtn = e.target.closest('[data-promote]');
            const demoteBtn = e.target.closest('[data-demote]');
            const deleteBtn = e.target.closest('[data-delete]');

            if (promoteBtn) changeRole(Number(promoteBtn.dataset.promote), 'admin');
            if (demoteBtn) changeRole(Number(demoteBtn.dataset.demote), 'guest');
            if (deleteBtn) deleteUser(Number(deleteBtn.dataset.delete));
        });
    }

    function init() {
        const token = AuthUtils.getToken();
        currentUserId = token ? AuthUtils.decodeToken(token)?.id : null;
        bindEvents();
        loadUsers();
    }

    return { init };
})();

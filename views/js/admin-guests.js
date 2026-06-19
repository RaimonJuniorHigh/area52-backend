// ==========================================
// AREA52 ADMIN GUESTS
// ==========================================

const AdminGuests = (() => {
    const API = '/api/admin/guests';

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

    function updateStats(guests) {
        const countEl = document.getElementById('guest-count');
        const activeEl = document.getElementById('guest-active-count');
        if (countEl) countEl.textContent = String(guests.length);
        if (activeEl) {
            activeEl.textContent = String(guests.filter(g => g.activeRentals > 0).length);
        }
    }

    function renderTable(guests) {
        const tbody = document.getElementById('guests-tbody');
        if (!tbody) return;

        if (!guests.length) {
            tbody.innerHTML = '<tr><td colspan="4">Nog geen gastaccounts geregistreerd.</td></tr>';
            return;
        }

        tbody.innerHTML = guests.map(guest => `
            <tr>
                <td>${guest.id}</td>
                <td>${guest.email}</td>
                <td>${guest.activeRentals > 0
                    ? `<span class="admin-badge admin-badge--active">${guest.activeRentals}</span>`
                    : '0'}</td>
                <td>${guest.totalRentals}</td>
            </tr>
        `).join('');
    }

    async function loadGuests() {
        const tbody = document.getElementById('guests-tbody');
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Laden mislukt');
            updateStats(data);
            renderTable(data);
            showMessage('');
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
            showMessage(err.message, true);
        }
    }

    function init() {
        loadGuests();
    }

    return { init };
})();

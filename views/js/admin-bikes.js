// ==========================================
// AREA52 ADMIN BIKES - CRUD via BikeRental backend
// ==========================================

const AdminBikes = (() => {
    const API = '/api/admin/bikes';
    let bikesCache = [];

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthUtils.getToken()}`,
        };
    }

    function showMessage(text, isError = false) {
        const el = document.getElementById('bike-form-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function resetForm() {
        document.getElementById('bike-id').value = '';
        document.getElementById('bike-form').reset();
        document.getElementById('bike-deposit').value = '0';
        document.getElementById('bike-status').value = 'available';
        document.getElementById('bike-form-title').innerText = 'Fiets toevoegen';
        document.getElementById('bike-submit-btn').innerText = 'Opslaan';
        showMessage('');
    }

    function fillForm(bike) {
        document.getElementById('bike-id').value = bike.id;
        document.getElementById('bike-name').value = bike.name;
        document.getElementById('bike-type').value = bike.type;
        document.getElementById('bike-price').value = bike.pricePerDay;
        document.getElementById('bike-deposit').value = bike.deposit;
        document.getElementById('bike-image').value = bike.imageUrl || '';
        document.getElementById('bike-status').value = bike.status;
        document.getElementById('bike-form-title').innerText = 'Fiets bewerken';
        document.getElementById('bike-submit-btn').innerText = 'Bijwerken';
        showMessage('');
    }

    function statusLabel(status) {
        return status === 'rented'
            ? '<span class="admin-badge">Verhuurd</span>'
            : '<span class="admin-badge admin-badge--active">Beschikbaar</span>';
    }

    function renderTable(bikes) {
        const tbody = document.getElementById('bikes-tbody');
        if (!tbody) return;

        if (!bikes.length) {
            tbody.innerHTML = '<tr><td colspan="7">Nog geen fietsen.</td></tr>';
            return;
        }

        tbody.innerHTML = bikes.map(bike => `
            <tr>
                <td>${bike.id}</td>
                <td>${bike.name}</td>
                <td>${bike.type}</td>
                <td>€${Number(bike.pricePerDay).toFixed(2)}</td>
                <td>€${Number(bike.deposit).toFixed(2)}</td>
                <td>${statusLabel(bike.status)}</td>
                <td class="bike-table__actions">
                    <button class="admin-btn admin-btn--sm" data-edit="${bike.id}">Bewerk</button>
                    <button class="admin-btn admin-btn--sm admin-btn--danger" data-delete="${bike.id}">Verwijder</button>
                </td>
            </tr>
        `).join('');
    }

    async function loadBikes() {
        const tbody = document.getElementById('bikes-tbody');
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Laden mislukt');
            bikesCache = data;
            renderTable(bikesCache);
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="7">${err.message}</td></tr>`;
        }
    }

    function getFormData() {
        return {
            name: document.getElementById('bike-name').value,
            type: document.getElementById('bike-type').value,
            pricePerDay: parseFloat(document.getElementById('bike-price').value),
            deposit: parseFloat(document.getElementById('bike-deposit').value) || 0,
            imageUrl: document.getElementById('bike-image').value.trim(),
            status: document.getElementById('bike-status').value,
        };
    }

    async function saveBike(e) {
        e.preventDefault();
        const id = document.getElementById('bike-id').value;
        const body = getFormData();
        const isEdit = Boolean(id);

        try {
            const res = await fetch(isEdit ? `${API}/${id}` : API, {
                method: isEdit ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Opslaan mislukt');

            showMessage(isEdit ? 'Fiets bijgewerkt.' : 'Fiets toegevoegd.');
            resetForm();
            await loadBikes();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    async function deleteBike(id) {
        if (!confirm('Weet je zeker dat je deze fiets wilt verwijderen?')) return;

        try {
            const res = await fetch(`${API}/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verwijderen mislukt');
            await loadBikes();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    function bindEvents() {
        document.getElementById('bike-form')?.addEventListener('submit', saveBike);
        document.getElementById('bike-reset-btn')?.addEventListener('click', resetForm);
        document.getElementById('bike-cancel-btn')?.addEventListener('click', resetForm);

        document.getElementById('bikes-tbody')?.addEventListener('click', (e) => {
            const editId = e.target.dataset?.edit;
            const deleteId = e.target.dataset?.delete;

            if (editId) {
                const bike = bikesCache.find(b => String(b.id) === editId);
                if (bike) fillForm(bike);
            }
            if (deleteId) deleteBike(deleteId);
        });
    }

    function init() {
        bindEvents();
        resetForm();
        loadBikes();
    }

    return { init };
})();

// ==========================================
// AREA52 ADMIN OPENING HOURS
// ==========================================

const AdminOpeningHours = (() => {
    const API = '/api/admin/facilities';
    const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const DAY_LABELS = {
        mon: 'Ma', tue: 'Di', wed: 'Wo', thu: 'Do', fri: 'Vr', sat: 'Za', sun: 'Zo',
    };
    const CATEGORY_LABELS = {
        zwembad: 'Zwembad',
        supermarkt: 'Supermarkt',
        restaurant: 'Restaurant',
        fietsverhuur: 'Fietsverhuur',
        activiteit: 'Activiteit',
    };

    let facilitiesCache = [];
    let dragId = null;

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthUtils.getToken()}`,
        };
    }

    function showMessage(text, isError = false, form = false) {
        const el = document.getElementById(form ? 'facility-form-message' : 'facility-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function openModal() {
        document.getElementById('facility-form-modal').hidden = false;
    }

    function closeModal() {
        document.getElementById('facility-form-modal').hidden = true;
    }

    function buildHoursGrid() {
        const grid = document.getElementById('facility-hours-grid');
        if (!grid) return;
        grid.innerHTML = DAY_KEYS.map(day => `
            <div class="hours-form__row" data-day="${day}">
                <span class="hours-form__day-label">${DAY_LABELS[day]}</span>
                <input type="time" class="hours-form__open" data-day="${day}" aria-label="${DAY_LABELS[day]} open">
                <input type="time" class="hours-form__close" data-day="${day}" aria-label="${DAY_LABELS[day]} sluit">
                <label class="hours-form__closed-label">
                    <input type="checkbox" class="hours-form__closed" data-day="${day}"> Gesloten
                </label>
            </div>
        `).join('');

        grid.querySelectorAll('.hours-form__closed').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const day = e.target.dataset.day;
                const row = grid.querySelector(`[data-day="${day}"]`);
                const open = row?.querySelector('.hours-form__open');
                const close = row?.querySelector('.hours-form__close');
                const disabled = e.target.checked;
                if (open) { open.disabled = disabled; if (disabled) open.value = ''; }
                if (close) { close.disabled = disabled; if (disabled) close.value = ''; }
            });
        });
    }

    function readHoursFromForm() {
        const hours = {};
        DAY_KEYS.forEach(day => {
            const row = document.querySelector(`#facility-hours-grid [data-day="${day}"]`);
            const closed = row?.querySelector('.hours-form__closed')?.checked;
            const open = row?.querySelector('.hours-form__open')?.value;
            const close = row?.querySelector('.hours-form__close')?.value;
            hours[day] = closed || !open || !close
                ? { open: null, close: null }
                : { open, close };
        });
        return hours;
    }

    function fillHoursForm(weeklyHours) {
        DAY_KEYS.forEach(day => {
            const row = document.querySelector(`#facility-hours-grid [data-day="${day}"]`);
            if (!row) return;
            const dayHours = weeklyHours?.[day] || { open: null, close: null };
            const closed = !dayHours.open || !dayHours.close;
            const cb = row.querySelector('.hours-form__closed');
            const open = row.querySelector('.hours-form__open');
            const close = row.querySelector('.hours-form__close');
            if (cb) cb.checked = closed;
            if (open) { open.value = dayHours.open || ''; open.disabled = closed; }
            if (close) { close.value = dayHours.close || ''; close.disabled = closed; }
        });
    }

    function resetForm() {
        document.getElementById('facility-id').value = '';
        document.getElementById('facility-form').reset();
        document.getElementById('facility-icon').value = '📍';
        document.getElementById('facility-form-title').innerText = 'Locatie toevoegen';
        document.getElementById('facility-submit-btn').innerText = 'Opslaan';
        fillHoursForm({});
        showMessage('', false, true);
        closeModal();
    }

    function openFormForCreate() {
        document.getElementById('facility-id').value = '';
        document.getElementById('facility-form').reset();
        document.getElementById('facility-icon').value = '📍';
        document.getElementById('facility-form-title').innerText = 'Locatie toevoegen';
        document.getElementById('facility-submit-btn').innerText = 'Opslaan';
        fillHoursForm({});
        showMessage('', false, true);
        openModal();
    }

    function fillForm(facility) {
        document.getElementById('facility-id').value = facility.id;
        document.getElementById('facility-name').value = facility.name;
        document.getElementById('facility-category').value = facility.category;
        document.getElementById('facility-icon').value = facility.icon;
        document.getElementById('facility-description').value = facility.description || '';
        document.getElementById('facility-form-title').innerText = 'Locatie bewerken';
        document.getElementById('facility-submit-btn').innerText = 'Bijwerken';
        fillHoursForm(facility.weeklyHours);
        showMessage('', false, true);
        openModal();
    }

    function renderTable(facilities) {
        const tbody = document.getElementById('facilities-tbody');
        if (!tbody) return;

        if (!facilities.length) {
            tbody.innerHTML = '<tr><td colspan="6">Nog geen locaties.</td></tr>';
            return;
        }

        tbody.innerHTML = facilities.map(f => `
            <tr draggable="true" data-id="${f.id}" class="hours-row">
                <td class="hours-col-drag" title="Sleep om te verplaatsen"><span class="hours-drag-handle">⋮⋮</span></td>
                <td class="hours-col-icon">${f.icon}</td>
                <td>${f.name}</td>
                <td>${CATEGORY_LABELS[f.category] || f.category}</td>
                <td>${f.isOpenNow
                    ? '<span class="admin-badge admin-badge--active">Open</span>'
                    : '<span class="admin-badge">Gesloten</span>'}</td>
                <td class="bike-table__actions">
                    <button type="button" class="admin-btn admin-btn--sm" data-edit="${f.id}">Bewerk</button>
                    <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-delete="${f.id}">Verwijder</button>
                </td>
            </tr>
        `).join('');
    }

    async function loadCategories() {
        const select = document.getElementById('facility-category');
        if (!select || select.options.length) return;
        try {
            const res = await fetch(`${API}/categories`, { headers: authHeaders() });
            const cats = await res.json();
            select.innerHTML = cats.map(c =>
                `<option value="${c}">${CATEGORY_LABELS[c] || c}</option>`
            ).join('');
        } catch {
            select.innerHTML = Object.keys(CATEGORY_LABELS).map(c =>
                `<option value="${c}">${CATEGORY_LABELS[c]}</option>`
            ).join('');
        }
    }

    async function loadFacilities() {
        const tbody = document.getElementById('facilities-tbody');
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Laden mislukt');
            facilitiesCache = data;
            renderTable(facilitiesCache);
            showMessage('');
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
            showMessage(err.message, true);
        }
    }

    async function saveOrderFromDom() {
        const rows = [...document.querySelectorAll('#facilities-tbody tr[data-id]')];
        const order = rows.map(r => Number(r.dataset.id));
        if (!order.length) return;

        try {
            const res = await fetch(`${API}/reorder`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ order }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Volgorde opslaan mislukt');
            showMessage('Volgorde opgeslagen.');
            await loadFacilities();
        } catch (err) {
            showMessage(err.message, true);
            await loadFacilities();
        }
    }

    function bindDragDrop() {
        const tbody = document.getElementById('facilities-tbody');
        if (!tbody) return;

        tbody.addEventListener('dragstart', (e) => {
            const row = e.target.closest('tr[data-id]');
            if (!row) return;
            dragId = row.dataset.id;
            row.classList.add('hours-row--dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        tbody.addEventListener('dragend', (e) => {
            const row = e.target.closest('tr[data-id]');
            if (row) row.classList.remove('hours-row--dragging');
            document.querySelectorAll('.hours-row--over').forEach(r => r.classList.remove('hours-row--over'));
            dragId = null;
        });

        tbody.addEventListener('dragover', (e) => {
            e.preventDefault();
            const row = e.target.closest('tr[data-id]');
            if (!row || row.dataset.id === dragId) return;
            document.querySelectorAll('.hours-row--over').forEach(r => r.classList.remove('hours-row--over'));
            row.classList.add('hours-row--over');
        });

        tbody.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('tr[data-id]');
            const source = tbody.querySelector(`tr[data-id="${dragId}"]`);
            if (!target || !source || target === source) return;
            target.classList.remove('hours-row--over');
            const rect = target.getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            tbody.insertBefore(source, before ? target : target.nextSibling);
            saveOrderFromDom();
        });
    }

    async function saveFacility(e) {
        e.preventDefault();
        const id = document.getElementById('facility-id').value;
        const body = {
            name: document.getElementById('facility-name').value,
            category: document.getElementById('facility-category').value,
            icon: document.getElementById('facility-icon').value || '📍',
            description: document.getElementById('facility-description').value,
            weeklyHours: readHoursFromForm(),
        };
        const isEdit = Boolean(id);

        try {
            const res = await fetch(isEdit ? `${API}/${id}` : API, {
                method: isEdit ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Opslaan mislukt');
            showMessage(isEdit ? 'Locatie bijgewerkt.' : 'Locatie toegevoegd.');
            resetForm();
            await loadFacilities();
        } catch (err) {
            showMessage(err.message, true, true);
        }
    }

    async function deleteFacility(id) {
        if (!confirm('Weet je zeker dat je deze locatie wilt verwijderen?')) return;
        try {
            const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verwijderen mislukt');
            showMessage(data.message);
            await loadFacilities();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    function bindEvents() {
        document.getElementById('facility-add-btn')?.addEventListener('click', openFormForCreate);
        document.getElementById('facility-cancel-btn')?.addEventListener('click', resetForm);
        document.getElementById('facility-form')?.addEventListener('submit', saveFacility);

        document.getElementById('facilities-tbody')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-edit]');
            const deleteBtn = e.target.closest('[data-delete]');
            if (editBtn) {
                const f = facilitiesCache.find(x => String(x.id) === editBtn.dataset.edit);
                if (f) fillForm(f);
            }
            if (deleteBtn) deleteFacility(Number(deleteBtn.dataset.delete));
        });

        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('facility-form-modal');
            if (!modal || modal.hidden) return;
            if (e.key === 'Escape') e.preventDefault();
        });

        bindDragDrop();
    }

    async function init() {
        buildHoursGrid();
        await loadCategories();
        bindEvents();
        closeModal();
        await loadFacilities();
    }

    return { init };
})();

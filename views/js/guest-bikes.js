// ==========================================
// AREA52 GUEST BIKES
// ==========================================

const GuestBikes = (() => {
    let selectedBike = null;
    let bikesCache = [];

    function showMessage(text, isError = false) {
        const el = document.getElementById('bike-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function ensureAgeField() {
        if (document.getElementById('rent-age')) return;
        const form = document.getElementById('rent-form');
        const preview = document.getElementById('rent-price-preview');
        if (!form || !preview) return;

        const field = document.createElement('div');
        field.className = 'auth-field';
        field.innerHTML = `
            <label for="rent-age">Leeftijd</label>
            <input id="rent-age" type="number" min="0" max="120" required placeholder="Minimaal 18 jaar">
        `;
        form.insertBefore(field, preview);
    }

    function renderBikes() {
        const grid = document.getElementById('bike-grid');
        if (!grid) return;

        grid.innerHTML = bikesCache.map(bike => `
            <article class="guest-bike-card">
                <div class="guest-bike-card__icon">🚲</div>
                <h3>${bike.name}</h3>
                <p class="guest-bike-card__type">${bike.type}</p>
                <p class="guest-bike-card__price">${GuestApi.formatEuro(bike.pricePerDay)}/dag · borg ${GuestApi.formatEuro(bike.deposit)}</p>
                <button class="admin-btn" data-rent="${bike.id}" ${bike.isBookedByUser || bike.isRented ? 'disabled' : ''}>
                    ${bike.isBookedByUser ? 'Geboekt' : bike.isRented ? 'Verhuurd' : 'Huren'}
                </button>
            </article>
        `).join('');
    }

    async function loadBikes() {
        try {
            bikesCache = await GuestApi.getBikes();
            renderBikes();
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    function openModal(bikeId) {
        selectedBike = bikesCache.find(b => b.id === bikeId);
        if (!selectedBike) return;

        document.getElementById('rent-bike-id').value = bikeId;
        document.getElementById('rent-modal-title').textContent = `${selectedBike.name} huren`;
        document.getElementById('rent-start').value = '';
        document.getElementById('rent-end').value = '';
        document.getElementById('rent-age').value = '';
        document.getElementById('rent-price-preview').textContent = '';
        document.getElementById('rent-modal').hidden = false;
    }

    function closeModal() {
        document.getElementById('rent-modal').hidden = true;
        selectedBike = null;
    }

    function updatePricePreview() {
        const start = document.getElementById('rent-start').value;
        const end = document.getElementById('rent-end').value;
        const preview = document.getElementById('rent-price-preview');
        if (!selectedBike || !start || !end || !preview) return;

        const startD = new Date(start);
        const endD = new Date(end);
        if (endD < startD) {
            preview.textContent = 'Einddatum moet na startdatum liggen.';
            return;
        }
        const days = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
        preview.textContent = `Totaal: ${GuestApi.formatEuro(selectedBike.pricePerDay * days)} (${days} dag(en))`;
    }

    function bindEvents() {
        document.getElementById('bike-grid')?.addEventListener('click', (e) => {
            const id = Number(e.target.dataset?.rent);
            if (id) openModal(id);
        });

        document.getElementById('rent-cancel')?.addEventListener('click', closeModal);
        document.getElementById('rent-start')?.addEventListener('change', updatePricePreview);
        document.getElementById('rent-end')?.addEventListener('change', updatePricePreview);

        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('rent-modal');
            if (!modal || modal.hidden) return;
            if (e.key === 'Escape') e.preventDefault();
        });

        document.getElementById('rent-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const bikeId = Number(document.getElementById('rent-bike-id').value);
            const startDate = document.getElementById('rent-start').value;
            const endDate = document.getElementById('rent-end').value;
            const age = Number(document.getElementById('rent-age').value);

            try {
                const data = await GuestApi.rentBike(bikeId, startDate, endDate, age);
                showMessage(data.message);
                closeModal();
                await loadBikes();
            } catch (err) {
                showMessage(err.message, true);
            }
        });
    }

    function init() {
        ensureAgeField();
        bindEvents();
        loadBikes();
    }

    return { init };
})();

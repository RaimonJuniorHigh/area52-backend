// ==========================================
// AREA52 GUEST BIKES
// ==========================================

const GuestBikes = (() => {
    let selectedBike = null;

    function showMessage(text, isError = false) {
        const el = document.getElementById('bike-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function renderBikes() {
        const grid = document.getElementById('bike-grid');
        if (!grid) return;

        const bikes = GuestMockData.getBikes();
        grid.innerHTML = bikes.map(bike => `
            <article class="guest-bike-card">
                <div class="guest-bike-card__icon">🚲</div>
                <h3>${bike.name}</h3>
                <p class="guest-bike-card__type">${bike.type}</p>
                <p class="guest-bike-card__price">${GuestMockData.formatEuro(bike.pricePerDay)}/dag · borg ${GuestMockData.formatEuro(bike.deposit)}</p>
                <button class="admin-btn" data-rent="${bike.id}" ${bike.isBookedByUser ? 'disabled' : ''}>
                    ${bike.isBookedByUser ? 'Geboekt' : 'Huren'}
                </button>
            </article>
        `).join('');
    }

    function openModal(bikeId) {
        selectedBike = GuestMockData.getBikes().find(b => b.id === bikeId);
        if (!selectedBike) return;

        document.getElementById('rent-bike-id').value = bikeId;
        document.getElementById('rent-modal-title').textContent = `${selectedBike.name} huren`;
        document.getElementById('rent-start').value = '';
        document.getElementById('rent-end').value = '';
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
        preview.textContent = `Totaal: ${GuestMockData.formatEuro(selectedBike.pricePerDay * days)} (${days} dag(en))`;
    }

    function bindEvents() {
        document.getElementById('bike-grid')?.addEventListener('click', (e) => {
            const id = Number(e.target.dataset?.rent);
            if (id) openModal(id);
        });

        document.getElementById('rent-cancel')?.addEventListener('click', closeModal);
        document.getElementById('rent-start')?.addEventListener('change', updatePricePreview);
        document.getElementById('rent-end')?.addEventListener('change', updatePricePreview);

        document.getElementById('rent-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const bikeId = Number(document.getElementById('rent-bike-id').value);
            const startDate = document.getElementById('rent-start').value;
            const endDate = document.getElementById('rent-end').value;
            const result = GuestMockData.rentBike(bikeId, startDate, endDate);

            if (result.ok) {
                showMessage(result.message);
                closeModal();
                renderBikes();
            } else {
                showMessage(result.message, true);
            }
        });

        document.getElementById('rent-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'rent-modal') closeModal();
        });
    }

    function init() {
        bindEvents();
        renderBikes();
    }

    return { init };
})();

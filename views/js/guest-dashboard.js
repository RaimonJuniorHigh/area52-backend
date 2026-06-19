// ==========================================
// AREA52 GUEST DASHBOARD
// ==========================================

const GuestDashboard = (() => {
    function renderBookingItem(booking) {
        const typeLabel = booking.type === 'bike' ? 'Fiets' : 'Evenement';
        const dateRange = booking.type === 'bike'
            ? `${GuestApi.formatDate(booking.startDate)} – ${GuestApi.formatDate(booking.endDate)}`
            : `${GuestApi.formatDate(booking.startDate)} om ${booking.subtitle}`;

        return `<article class="guest-booking-item">
            <div class="guest-booking-item__main">
                <span class="guest-booking-item__type">${typeLabel}</span>
                <strong>${booking.title}</strong>
                <span class="guest-booking-item__date">${dateRange}</span>
            </div>
            <div class="guest-booking-item__price">${GuestApi.formatEuro(booking.price)}</div>
        </article>`;
    }

    function renderList(containerId, items, emptyText) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = items.length
            ? items.map(renderBookingItem).join('')
            : `<p class="guest-empty">${emptyText}</p>`;
    }

    async function init() {
        const email = AuthUtils.getEmail();
        const welcome = document.getElementById('guest-welcome');
        if (welcome) {
            welcome.textContent = email
                ? `Welkom terug, ${email}.`
                : 'Welkom bij Area52.';
        }

        try {
            const data = await GuestApi.getDashboard();
            document.getElementById('stat-bikes').textContent = data.bikeCount;
            document.getElementById('stat-events').textContent = data.eventCount;
            document.getElementById('stat-spent').textContent = GuestApi.formatEuro(data.totalSpent);

            renderList('upcoming-list', data.upcoming, 'Geen komende boekingen. Huur een fiets of schrijf je in voor een evenement.');
            renderList('recent-history', data.history, 'Nog geen historie.');
        } catch {
            renderList('upcoming-list', [], 'Kon boekingen niet laden.');
        }
    }

    return { init };
})();

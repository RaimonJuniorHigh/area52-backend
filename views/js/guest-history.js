// ==========================================
// AREA52 GUEST HISTORY
// ==========================================

const GuestHistory = (() => {
    function renderHistory(bookings) {
        const list = document.getElementById('history-list');
        if (!list) return;

        if (!bookings.length) {
            list.innerHTML = '<p class="guest-empty">Nog geen afgeronde boekingen.</p>';
            return;
        }

        list.innerHTML = bookings.map(booking => {
            const typeLabel = booking.type === 'bike' ? 'Fiets' : 'Evenement';
            const dateRange = booking.type === 'bike'
                ? `${GuestApi.formatDate(booking.startDate)} – ${GuestApi.formatDate(booking.endDate)}`
                : `${GuestApi.formatDate(booking.startDate)} om ${booking.subtitle}`;

            return `<article class="guest-booking-item guest-booking-item--history">
                <div class="guest-booking-item__main">
                    <span class="guest-booking-item__type">${typeLabel}</span>
                    <strong>${booking.title}</strong>
                    <span class="guest-booking-item__date">${dateRange}</span>
                </div>
                <div class="guest-booking-item__price">${GuestApi.formatEuro(booking.price)}</div>
            </article>`;
        }).join('');
    }

    async function init() {
        try {
            const bookings = await GuestApi.getHistory();
            renderHistory(bookings);
        } catch {
            renderHistory([]);
        }
    }

    return { init };
})();

// ==========================================
// AREA52 GUEST HISTORY
// ==========================================

const GuestHistory = (() => {
    function renderHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;

        const bookings = GuestMockData.getHistoryBookings();
        if (!bookings.length) {
            list.innerHTML = '<p class="guest-empty">Nog geen afgeronde boekingen.</p>';
            return;
        }

        list.innerHTML = bookings.map(booking => {
            const typeLabel = booking.type === 'bike' ? 'Fiets' : 'Evenement';
            const dateRange = booking.type === 'bike'
                ? `${GuestMockData.formatDate(booking.startDate)} – ${GuestMockData.formatDate(booking.endDate)}`
                : `${GuestMockData.formatDate(booking.startDate)} om ${booking.subtitle}`;

            return `<article class="guest-booking-item guest-booking-item--history">
                <div class="guest-booking-item__main">
                    <span class="guest-booking-item__type">${typeLabel}</span>
                    <strong>${booking.title}</strong>
                    <span class="guest-booking-item__date">${dateRange}</span>
                </div>
                <div class="guest-booking-item__price">${GuestMockData.formatEuro(booking.price)}</div>
            </article>`;
        }).join('');
    }

    function init() {
        renderHistory();
    }

    return { init };
})();

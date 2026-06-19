// ==========================================
// AREA52 GUEST EVENTS
// ==========================================

const GuestEvents = (() => {
    function showMessage(text, isError = false) {
        const el = document.getElementById('event-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function renderEvents() {
        const list = document.getElementById('event-list');
        if (!list) return;

        const events = GuestMockData.getEvents();
        list.innerHTML = events.map(event => `
            <article class="guest-event-card">
                <div class="guest-event-card__header">
                    <h3>${event.title}</h3>
                    <span class="admin-badge admin-badge--active">${GuestMockData.formatEuro(event.price)}</span>
                </div>
                <p class="guest-event-card__desc">${event.description}</p>
                <div class="guest-event-card__meta">
                    <span>${GuestMockData.formatDate(event.date)} · ${event.time}</span>
                    <span>${event.spotsLeft} plek(ken) over</span>
                </div>
                <button class="admin-btn" data-book="${event.id}"
                    ${event.userBooked || event.spotsLeft <= 0 ? 'disabled' : ''}>
                    ${event.userBooked ? 'Ingeschreven' : event.spotsLeft <= 0 ? 'Vol' : 'Inschrijven'}
                </button>
            </article>
        `).join('');
    }

    function bindEvents() {
        document.getElementById('event-list')?.addEventListener('click', (e) => {
            const id = Number(e.target.dataset?.book);
            if (!id) return;

            const result = GuestMockData.bookEvent(id);
            if (result.ok) {
                showMessage(result.message);
                renderEvents();
            } else {
                showMessage(result.message, true);
            }
        });
    }

    function init() {
        bindEvents();
        renderEvents();
    }

    return { init };
})();

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

    function renderEvents(events) {
        const list = document.getElementById('event-list');
        if (!list) return;

        list.innerHTML = events.map(event => `
            <article class="guest-event-card">
                <div class="guest-event-card__header">
                    <h3>${event.title}</h3>
                    <span class="admin-badge admin-badge--active">${GuestApi.formatEuro(event.price)}</span>
                </div>
                <p class="guest-event-card__desc">${event.description}</p>
                <div class="guest-event-card__meta">
                    <span>${event.time}${event.endTime ? ' – ' + event.endTime : ''} · ${event.location}</span>
                    <span>${event.spotsLeft} plek(ken) over</span>
                </div>
                <button class="admin-btn" data-book="${event.id}"
                    ${event.userBooked || event.spotsLeft <= 0 ? 'disabled' : ''}>
                    ${event.userBooked ? 'Ingeschreven' : event.spotsLeft <= 0 ? 'Vol' : 'Inschrijven'}
                </button>
            </article>
        `).join('');
    }

    async function loadEvents() {
        try {
            const events = await GuestApi.getEvents();
            renderEvents(events);
        } catch (err) {
            showMessage(err.message, true);
        }
    }

    function bindEvents() {
        document.getElementById('event-list')?.addEventListener('click', async (e) => {
            const id = Number(e.target.dataset?.book);
            if (!id) return;

            try {
                const data = await GuestApi.bookEvent(id);
                showMessage(data.message);
                await loadEvents();
            } catch (err) {
                showMessage(err.message, true);
            }
        });
    }

    function init() {
        bindEvents();
        loadEvents();
    }

    return { init };
})();

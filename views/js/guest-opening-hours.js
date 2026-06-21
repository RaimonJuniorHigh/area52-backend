// ==========================================
// AREA52 GUEST OPENING HOURS
// ==========================================

const GuestOpeningHours = (() => {
    const API = '/api/guest/facilities';

    const CATEGORY_LABELS = {
        zwembad: 'Zwembad',
        supermarkt: 'Supermarkt',
        restaurant: 'Restaurant',
        fietsverhuur: 'Fietsverhuur',
        activiteit: 'Activiteit',
    };

    const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const DAY_LABELS = {
        mon: 'Maandag', tue: 'Dinsdag', wed: 'Woensdag', thu: 'Donderdag',
        fri: 'Vrijdag', sat: 'Zaterdag', sun: 'Zondag',
    };

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthUtils.getToken()}`,
        };
    }

    function showMessage(text, isError = false) {
        const el = document.getElementById('hours-message');
        if (!el) return;
        el.className = isError ? 'auth-message auth-message--error' : 'auth-message auth-message--success';
        el.innerText = text;
    }

    function formatDayHours(day) {
        if (!day?.open || !day?.close) return 'Gesloten';
        return `${day.open} – ${day.close}`;
    }

    function renderHoursList(weeklyHours) {
        return DAY_ORDER.map(key => `
            <li class="hours-card__day">
                <span class="hours-card__day-name">${DAY_LABELS[key]}</span>
                <span class="hours-card__day-time">${formatDayHours(weeklyHours[key])}</span>
            </li>
        `).join('');
    }

    function renderCard(facility) {
        const openClass = facility.isOpenNow ? 'hours-card--open' : 'hours-card--closed';
        const statusText = facility.isOpenNow ? 'Nu open' : 'Nu gesloten';
        const category = CATEGORY_LABELS[facility.category] || facility.category;

        return `
            <article class="hours-card ${openClass}" data-id="${facility.id}">
                <div class="hours-card__header">
                    <div class="hours-card__icon">${facility.icon}</div>
                    <div class="hours-card__titles">
                        <span class="hours-card__category">${category}</span>
                        <h2 class="hours-card__name">${facility.name}</h2>
                    </div>
                    <span class="hours-card__status">${statusText}</span>
                </div>
                ${facility.description ? `<p class="hours-card__desc">${facility.description}</p>` : ''}
                <ul class="hours-card__days">${renderHoursList(facility.weeklyHours)}</ul>
            </article>
        `;
    }

    async function loadFacilities() {
        const grid = document.getElementById('hours-grid');
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Laden mislukt');

            if (!data.length) {
                grid.innerHTML = '<p class="guest-intro">Nog geen openingstijden beschikbaar.</p>';
                return;
            }

            grid.innerHTML = data.map(renderCard).join('');
            showMessage('');
        } catch (err) {
            if (grid) grid.innerHTML = '';
            showMessage(err.message, true);
        }
    }

    function init() {
        loadFacilities();
    }

    return { init };
})();

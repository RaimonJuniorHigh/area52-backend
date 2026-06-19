// ==========================================
// AREA52 GUEST API
// Doel: API-calls naar backend met BikeRental logica. Frontend helpers blijven hier.
// ==========================================

const GuestApi = (() => {
    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthUtils.getToken()}`,
        };
    }

    async function request(url, options = {}) {
        const res = await fetch(url, {
            ...options,
            headers: { ...authHeaders(), ...options.headers },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Verzoek mislukt.');
        return data;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-NL', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });
    }

    function formatEuro(amount) {
        return `€${Number(amount).toFixed(2)}`;
    }

    async function getBikes() {
        return request('/api/guest/bikes');
    }

    async function rentBike(bikeId, startDate, endDate, age) {
        return request('/api/guest/bikes/rent', {
            method: 'POST',
            body: JSON.stringify({ bikeId, startDate, endDate, age }),
        });
    }

    async function getEvents() {
        return request('/api/guest/events');
    }

    async function bookEvent(eventId, age = 18) {
        return request('/api/guest/events/book', {
            method: 'POST',
            body: JSON.stringify({ eventId, age }),
        });
    }

    async function getDashboard() {
        return request('/api/guest/dashboard');
    }

    async function getHistory() {
        return request('/api/guest/history');
    }

    return {
        formatDate,
        formatEuro,
        getBikes,
        rentBike,
        getEvents,
        bookEvent,
        getDashboard,
        getHistory,
    };
})();

// ==========================================
// AREA52 GUEST MOCK DATA
// Doel: Tijdelijke data + localStorage boekingen tot de echte API klaar is.
// ==========================================

const GuestMockData = (() => {
    const STORAGE_KEY = 'area52_guest_bookings';

    const BIKES = [
        { id: 1, name: 'Fontana', type: 'racebike', pricePerDay: 35, deposit: 200 },
        { id: 2, name: 'Gazelle', type: 'electric bike', pricePerDay: 28, deposit: 150 },
        { id: 3, name: 'Batavus', type: 'bike', pricePerDay: 12, deposit: 50 },
        { id: 4, name: 'Giant', type: 'mountainbike', pricePerDay: 30, deposit: 175 },
        { id: 5, name: 'Specialized', type: 'racebike', pricePerDay: 40, deposit: 250 },
        { id: 6, name: 'Trek', type: 'mountainbike', pricePerDay: 32, deposit: 180 },
    ];

    const EVENTS = [
        { id: 1, title: 'Bogenschieten', description: 'Leer veilig omgaan met een boog onder begeleiding.', date: '2026-06-25', time: '10:00', maxSpots: 12, price: 15 },
        { id: 2, title: 'Kanoën op het meer', description: 'Rustige tocht over het parkmeer.', date: '2026-06-26', time: '14:00', maxSpots: 8, price: 20 },
        { id: 3, title: 'Survival workshop', description: 'Vuur maken, shelter bouwen en oriëntatie.', date: '2026-06-28', time: '09:30', maxSpots: 15, price: 25 },
        { id: 4, title: 'Sterren kijken', description: 'Avondwandeling met gids en telescopen.', date: '2026-06-30', time: '21:00', maxSpots: 20, price: 10 },
    ];

    function getUserKey() {
        return AuthUtils.getEmail() || 'default';
    }

    function loadBookings() {
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return all[getUserKey()] || [];
        } catch {
            return [];
        }
    }

    function saveBookings(bookings) {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        all[getUserKey()] = bookings;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    function nextId(bookings) {
        return bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    }

    function formatDate(dateStr) {
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-NL', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });
    }

    function formatEuro(amount) {
        return `€${Number(amount).toFixed(2)}`;
    }

    function isPast(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateStr + 'T23:59:59') < today;
    }

    function getBikes() {
        const bookings = loadBookings();
        const activeBikeIds = bookings
            .filter(b => b.type === 'bike' && b.status === 'upcoming')
            .map(b => b.referenceId);

        return BIKES.map(bike => ({
            ...bike,
            isBookedByUser: activeBikeIds.includes(bike.id),
        }));
    }

    function getEvents() {
        const bookings = loadBookings();
        return EVENTS.map(event => {
            const bookedCount = bookings.filter(
                b => b.type === 'event' && b.referenceId === event.id && b.status === 'upcoming'
            ).length;
            const userBooked = bookings.some(
                b => b.type === 'event' && b.referenceId === event.id && b.status === 'upcoming'
            );
            return {
                ...event,
                spotsLeft: Math.max(0, event.maxSpots - bookedCount),
                userBooked,
            };
        });
    }

    function rentBike(bikeId, startDate, endDate) {
        const bike = BIKES.find(b => b.id === bikeId);
        if (!bike) return { ok: false, message: 'Fiets niet gevonden.' };

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return { ok: false, message: 'Einddatum moet na startdatum liggen.' };

        const bookings = loadBookings();
        if (bookings.some(b => b.type === 'bike' && b.referenceId === bikeId && b.status === 'upcoming')) {
            return { ok: false, message: 'Je hebt deze fiets al geboekt.' };
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const totalPrice = bike.pricePerDay * days;

        bookings.push({
            id: nextId(bookings),
            type: 'bike',
            referenceId: bikeId,
            title: bike.name,
            subtitle: bike.type,
            startDate,
            endDate,
            price: totalPrice,
            status: isPast(endDate) ? 'completed' : 'upcoming',
            bookedAt: new Date().toISOString(),
        });

        saveBookings(bookings);
        return { ok: true, message: `${bike.name} geboekt voor ${days} dag(en).` };
    }

    function bookEvent(eventId) {
        const event = EVENTS.find(e => e.id === eventId);
        if (!event) return { ok: false, message: 'Evenement niet gevonden.' };

        const events = getEvents();
        const eventState = events.find(e => e.id === eventId);
        if (eventState.userBooked) return { ok: false, message: 'Je bent al ingeschreven.' };
        if (eventState.spotsLeft <= 0) return { ok: false, message: 'Geen plekken meer.' };

        const bookings = loadBookings();
        bookings.push({
            id: nextId(bookings),
            type: 'event',
            referenceId: eventId,
            title: event.title,
            subtitle: event.time,
            startDate: event.date,
            endDate: event.date,
            price: event.price,
            status: isPast(event.date) ? 'completed' : 'upcoming',
            bookedAt: new Date().toISOString(),
        });

        saveBookings(bookings);
        return { ok: true, message: `Ingeschreven voor ${event.title}.` };
    }

    function getUpcomingBookings() {
        return loadBookings()
            .filter(b => b.status === 'upcoming' && !isPast(b.endDate || b.startDate))
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    function getHistoryBookings() {
        return loadBookings()
            .filter(b => b.status === 'completed' || isPast(b.endDate || b.startDate))
            .sort((a, b) => b.startDate.localeCompare(a.startDate));
    }

    function getDashboard() {
        const upcoming = getUpcomingBookings();
        const history = getHistoryBookings();
        const bikeCount = upcoming.filter(b => b.type === 'bike').length;
        const eventCount = upcoming.filter(b => b.type === 'event').length;
        const totalSpent = loadBookings().reduce((sum, b) => sum + b.price, 0);

        return { upcoming, history: history.slice(0, 3), bikeCount, eventCount, totalSpent };
    }

    return {
        getBikes,
        getEvents,
        rentBike,
        bookEvent,
        getUpcomingBookings,
        getHistoryBookings,
        getDashboard,
        formatDate,
        formatEuro,
    };
})();

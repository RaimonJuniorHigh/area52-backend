// ==========================================
// BIKE RENTAL SERVICE - AREA52
// Doel: Bridge naar BikeRental logica ZONDER BikeRental/ te wijzigen.
// ==========================================

import { bikes, Bike, calculateTotalPrice, rentBike } from '../../BikeRental/src/models/Bike';
import { events, Event } from '../../BikeRental/src/models/Event';
import { Rental } from '../../BikeRental/src/models/rental';
import { canRent, canParticipate } from '../../BikeRental/src/validations/age';
import { hasCapacity } from '../../BikeRental/src/validations/capacity';

const BIKE_TYPES: Bike['type'][] = ['bike', 'electric bike', 'racebike', 'mountainbike'];

const rentals: Rental[] = [];
const eventRegistrations: { guestId: number; eventId: number; bookedAt: string }[] = [];
let rentalIdCounter = 1;

export interface GuestBookingView {
    id: number;
    type: 'bike' | 'event';
    referenceId: number;
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    price: number;
    status: 'upcoming' | 'completed';
    bookedAt: string;
}

export interface GuestEventView {
    id: number;
    title: string;
    description: string;
    time: string;
    endTime: string;
    location: string;
    maxSpots: number;
    spotsLeft: number;
    price: number;
    userBooked: boolean;
}

export interface GuestBikeView {
    id: number;
    name: string;
    type: string;
    pricePerDay: number;
    deposit: number;
    image: string;
    isRented: boolean;
    isBookedByUser: boolean;
}

function nextBikeId(): number {
    return bikes.length ? Math.max(...bikes.map(b => b.id)) + 1 : 1;
}

function rentalToBooking(rental: Rental): GuestBookingView {
    const bike = bikes.find(b => b.id === rental.bikeId);
    const start = rental.rentalDate.toISOString().slice(0, 10);
    const endDate = new Date(rental.rentalDate);
    const days = bike ? Math.round(rental.totalPrice / bike.pricePerDay) : 1;
    endDate.setDate(endDate.getDate() + Math.max(days - 1, 0));

    return {
        id: rental.rentalId,
        type: 'bike',
        referenceId: rental.bikeId,
        title: bike?.name || `Fiets #${rental.bikeId}`,
        subtitle: bike?.type || '',
        startDate: start,
        endDate: endDate.toISOString().slice(0, 10),
        price: rental.totalPrice,
        status: rental.status === 'completed' ? 'completed' : 'upcoming',
        bookedAt: rental.rentalDate.toISOString(),
    };
}

// --- Admin: fietsen CRUD ---

export function listAllBikes(): Bike[] {
    return bikes;
}

export function getBikeById(id: number): Bike | undefined {
    return bikes.find(b => b.id === id);
}

export function createBike(data: {
    name: string;
    type: Bike['type'];
    pricePerDay: number;
    deposit: number;
    image?: string;
}): Bike | { error: string } {
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!BIKE_TYPES.includes(data.type)) return { error: 'Ongeldig fiets-type.' };
    if (data.pricePerDay < 0) return { error: 'Prijs per dag is ongeldig.' };

    const bike: Bike = {
        id: nextBikeId(),
        name: data.name.trim(),
        type: data.type,
        isRented: false,
        pricePerDay: data.pricePerDay,
        deposit: data.deposit ?? 0,
        image: data.image || '',
    };
    bikes.push(bike);
    return bike;
}

export function updateBike(
    id: number,
    data: { name: string; type: Bike['type']; pricePerDay: number; deposit: number; image?: string; isRented?: boolean }
): Bike | { error: string } {
    const bike = bikes.find(b => b.id === id);
    if (!bike) return { error: 'Fiets niet gevonden.' };
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!BIKE_TYPES.includes(data.type)) return { error: 'Ongeldig fiets-type.' };

    bike.name = data.name.trim();
    bike.type = data.type;
    bike.pricePerDay = data.pricePerDay;
    bike.deposit = data.deposit ?? 0;
    bike.image = data.image ?? bike.image;
    if (typeof data.isRented === 'boolean') bike.isRented = data.isRented;
    return bike;
}

export function deleteBike(id: number): { ok: boolean; error?: string } {
    const index = bikes.findIndex(b => b.id === id);
    if (index === -1) return { ok: false, error: 'Fiets niet gevonden.' };
    bikes.splice(index, 1);
    return { ok: true };
}

// --- Gast: fietsen ---

export function listBikesForGuest(guestId: number): GuestBikeView[] {
    const userRentalBikeIds = rentals
        .filter(r => r.guestId === guestId && r.status !== 'completed' && r.status !== 'cancelled')
        .map(r => r.bikeId);

    return bikes.map(bike => ({
        id: bike.id,
        name: bike.name,
        type: bike.type,
        pricePerDay: bike.pricePerDay,
        deposit: bike.deposit,
        image: bike.image,
        isRented: bike.isRented,
        isBookedByUser: userRentalBikeIds.includes(bike.id),
    }));
}

export function rentBikeForGuest(
    guestId: number,
    bikeId: number,
    days: number,
    age: number
): { ok: boolean; message: string; rental?: Rental } {
    if (!canRent({ name: '', age })) {
        return { ok: false, message: 'Je moet minimaal 18 jaar zijn om een fiets te huren.' };
    }
    if (days < 1) return { ok: false, message: 'Huurperiode moet minimaal 1 dag zijn.' };

    const bike = bikes.find(b => b.id === bikeId);
    if (!bike) return { ok: false, message: 'Fiets niet gevonden.' };
    if (bike.isRented) return { ok: false, message: 'Deze fiets is niet beschikbaar.' };

    const alreadyRented = rentals.some(
        r => r.guestId === guestId && r.bikeId === bikeId && r.status === 'active'
    );
    if (alreadyRented) return { ok: false, message: 'Je hebt deze fiets al geboekt.' };

    if (!rentBike(bike)) return { ok: false, message: 'Fiets kon niet gehuurd worden.' };

    const rental: Rental = {
        rentalId: rentalIdCounter++,
        guestId,
        bikeId: bike.id,
        rentalDate: new Date(),
        returnDate: null,
        status: 'active',
        totalPrice: calculateTotalPrice(bike, days),
    };
    rentals.push(rental);

    return { ok: true, message: `${bike.name} geboekt voor ${days} dag(en).`, rental };
}

// --- Gast: evenementen ---

export function listEventsForGuest(guestId: number): GuestEventView[] {
    return events.map((event: Event) => ({
        id: event.eventId,
        title: event.name,
        description: `Locatie: ${event.location}`,
        time: event.startTime,
        endTime: event.endTime,
        location: event.location,
        maxSpots: event.maxParticipants,
        spotsLeft: Math.max(0, event.maxParticipants - event.currentParticipants),
        price: event.price,
        userBooked: eventRegistrations.some(r => r.guestId === guestId && r.eventId === event.eventId),
    }));
}

export function bookEventForGuest(
    guestId: number,
    eventId: number,
    age: number
): { ok: boolean; message: string } {
    const event = events.find(e => e.eventId === eventId);
    if (!event) return { ok: false, message: 'Evenement niet gevonden.' };

    if (!canParticipate({ name: '', age }, event.minAge)) {
        return { ok: false, message: `Je moet minimaal ${event.minAge} jaar zijn voor dit evenement.` };
    }
    if (!hasCapacity(event)) return { ok: false, message: 'Geen plekken meer.' };

    const alreadyBooked = eventRegistrations.some(r => r.guestId === guestId && r.eventId === eventId);
    if (alreadyBooked) return { ok: false, message: 'Je bent al ingeschreven.' };

    event.currentParticipants += 1;
    eventRegistrations.push({ guestId, eventId, bookedAt: new Date().toISOString() });

    return { ok: true, message: `Ingeschreven voor ${event.name}.` };
}

// --- Gast: dashboard & historie ---

export function getGuestBookings(guestId: number): GuestBookingView[] {
    const bikeBookings = rentals
        .filter(r => r.guestId === guestId)
        .map(rentalToBooking);

    const eventBookings = eventRegistrations
        .filter(r => r.guestId === guestId)
        .map(reg => {
            const event = events.find(e => e.eventId === reg.eventId);
            return {
                id: reg.eventId * 10000 + guestId,
                type: 'event' as const,
                referenceId: reg.eventId,
                title: event?.name || `Evenement #${reg.eventId}`,
                subtitle: event?.startTime || '',
                startDate: reg.bookedAt.slice(0, 10),
                endDate: reg.bookedAt.slice(0, 10),
                price: event?.price || 0,
                status: 'upcoming' as const,
                bookedAt: reg.bookedAt,
            };
        });

    return [...bikeBookings, ...eventBookings];
}

export function getGuestDashboard(guestId: number) {
    const all = getGuestBookings(guestId);
    const upcoming = all.filter(b => b.status === 'upcoming');
    const history = all.filter(b => b.status === 'completed');

    return {
        upcoming,
        history: history.slice(0, 3),
        bikeCount: upcoming.filter(b => b.type === 'bike').length,
        eventCount: upcoming.filter(b => b.type === 'event').length,
        totalSpent: all.reduce((sum, b) => sum + b.price, 0),
    };
}

export { BIKE_TYPES };

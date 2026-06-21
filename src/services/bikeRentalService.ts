// ==========================================
// BIKE RENTAL SERVICE - AREA52
// Fietsen + verhuur in PostgreSQL; evenementen nog via BikeRental in-memory.
// BikeRental/ wordt niet gewijzigd — alleen validatie/prijslogica geïmporteerd.
// ==========================================

import pool from '../db/db';
import { Bike, calculateTotalPrice } from '../../BikeRental/src/models/Bike';
import { events, Event } from '../../BikeRental/src/models/Event';
import { canRent, canParticipate } from '../../BikeRental/src/validations/age';
import { hasCapacity } from '../../BikeRental/src/validations/capacity';

const BIKE_TYPES: Bike['type'][] = ['bike', 'electric bike', 'racebike', 'mountainbike'];

const eventRegistrations: { guestId: number; eventId: number; bookedAt: string }[] = [];

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

interface BikeRow {
    id: number;
    name: string;
    type: string;
    price_per_day: string;
    deposit: string;
    image_url: string | null;
    status: string;
}

interface RentalRow {
    rental_id: number;
    guest_id: number;
    bike_id: number;
    rental_date: Date;
    return_date: Date | null;
    status: 'reserved' | 'active' | 'completed' | 'cancelled';
    total_price: string;
    bike_name?: string;
    bike_type?: string;
}

function formatDate(value: Date | string | null): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

function rowToBike(row: BikeRow): Bike {
    return {
        id: row.id,
        name: row.name,
        type: row.type as Bike['type'],
        isRented: row.status === 'rented',
        pricePerDay: Number(row.price_per_day),
        deposit: Number(row.deposit),
        image: row.image_url || '',
    };
}

function rentalRowToBooking(row: RentalRow): GuestBookingView {
    const completed = row.status === 'completed' || row.status === 'cancelled';
    return {
        id: row.rental_id,
        type: 'bike',
        referenceId: row.bike_id,
        title: row.bike_name || `Fiets #${row.bike_id}`,
        subtitle: row.bike_type || '',
        startDate: formatDate(row.rental_date),
        endDate: formatDate(row.return_date),
        price: Number(row.total_price),
        status: completed ? 'completed' : 'upcoming',
        bookedAt: formatDate(row.rental_date),
    };
}

async function fetchBikeRow(id: number): Promise<BikeRow | undefined> {
    const result = await pool.query<BikeRow>('SELECT * FROM bikes WHERE id = $1', [id]);
    return result.rows[0];
}

// --- Admin: fietsen CRUD ---

export async function listAllBikes(): Promise<Bike[]> {
    const result = await pool.query<BikeRow>('SELECT * FROM bikes ORDER BY id');
    return result.rows.map(rowToBike);
}

export async function getBikeById(id: number): Promise<Bike | undefined> {
    const row = await fetchBikeRow(id);
    return row ? rowToBike(row) : undefined;
}

export async function createBike(data: {
    name: string;
    type: Bike['type'];
    pricePerDay: number;
    deposit: number;
    image?: string;
}): Promise<Bike | { error: string }> {
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!BIKE_TYPES.includes(data.type)) return { error: 'Ongeldig fiets-type.' };
    if (data.pricePerDay < 0) return { error: 'Prijs per dag is ongeldig.' };

    const result = await pool.query<BikeRow>(
        `INSERT INTO bikes (name, type, price_per_day, deposit, image_url, status)
         VALUES ($1, $2, $3, $4, $5, 'available')
         RETURNING *`,
        [data.name.trim(), data.type, data.pricePerDay, data.deposit ?? 0, data.image || null]
    );
    return rowToBike(result.rows[0]);
}

export async function updateBike(
    id: number,
    data: { name: string; type: Bike['type']; pricePerDay: number; deposit: number; image?: string; isRented?: boolean }
): Promise<Bike | { error: string }> {
    const existing = await fetchBikeRow(id);
    if (!existing) return { error: 'Fiets niet gevonden.' };
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!BIKE_TYPES.includes(data.type)) return { error: 'Ongeldig fiets-type.' };

    const status = typeof data.isRented === 'boolean'
        ? (data.isRented ? 'rented' : 'available')
        : existing.status;

    const result = await pool.query<BikeRow>(
        `UPDATE bikes
         SET name = $1, type = $2, price_per_day = $3, deposit = $4, image_url = $5, status = $6
         WHERE id = $7
         RETURNING *`,
        [
            data.name.trim(),
            data.type,
            data.pricePerDay,
            data.deposit ?? 0,
            data.image ?? existing.image_url,
            status,
            id,
        ]
    );
    return rowToBike(result.rows[0]);
}

export async function deleteBike(id: number): Promise<{ ok: boolean; error?: string }> {
    const existing = await fetchBikeRow(id);
    if (!existing) return { ok: false, error: 'Fiets niet gevonden.' };

    const active = await pool.query(
        `SELECT 1 FROM rentals WHERE bike_id = $1 AND status IN ('reserved', 'active') LIMIT 1`,
        [id]
    );
    if (active.rows.length) {
        return { ok: false, error: 'Fiets heeft actieve verhuringen en kan niet worden verwijderd.' };
    }

    await pool.query('DELETE FROM bikes WHERE id = $1', [id]);
    return { ok: true };
}

// --- Gast: fietsen ---

export async function listBikesForGuest(guestId: number): Promise<GuestBikeView[]> {
    const result = await pool.query<BikeRow & { user_booked: boolean }>(
        `SELECT b.*,
                EXISTS (
                    SELECT 1 FROM rentals r
                    WHERE r.bike_id = b.id
                      AND r.guest_id = $1
                      AND r.status IN ('reserved', 'active')
                ) AS user_booked
         FROM bikes b
         ORDER BY b.id`,
        [guestId]
    );

    return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        pricePerDay: Number(row.price_per_day),
        deposit: Number(row.deposit),
        image: row.image_url || '',
        isRented: row.status === 'rented',
        isBookedByUser: row.user_booked,
    }));
}

export async function rentBikeForGuest(
    guestId: number,
    bikeId: number,
    days: number,
    age: number,
    startDate: string,
    endDate: string
): Promise<{ ok: boolean; message: string }> {
    if (!canRent({ name: '', age })) {
        return { ok: false, message: 'Je moet minimaal 18 jaar zijn om een fiets te huren.' };
    }
    if (days < 1) return { ok: false, message: 'Huurperiode moet minimaal 1 dag zijn.' };
    if (!startDate || !endDate) return { ok: false, message: 'Start- en einddatum zijn verplicht.' };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const bikeResult = await client.query<BikeRow>(
            'SELECT * FROM bikes WHERE id = $1 FOR UPDATE',
            [bikeId]
        );
        if (!bikeResult.rows.length) {
            await client.query('ROLLBACK');
            return { ok: false, message: 'Fiets niet gevonden.' };
        }

        const row = bikeResult.rows[0];
        if (row.status === 'rented') {
            await client.query('ROLLBACK');
            return { ok: false, message: 'Deze fiets is niet beschikbaar.' };
        }

        const activeOnBike = await client.query(
            `SELECT 1 FROM rentals
             WHERE bike_id = $1 AND status IN ('reserved', 'active')
             LIMIT 1`,
            [bikeId]
        );
        if (activeOnBike.rows.length) {
            await client.query('ROLLBACK');
            return { ok: false, message: 'Deze fiets is niet beschikbaar.' };
        }

        const alreadyUser = await client.query(
            `SELECT 1 FROM rentals
             WHERE guest_id = $1 AND bike_id = $2 AND status IN ('reserved', 'active')
             LIMIT 1`,
            [guestId, bikeId]
        );
        if (alreadyUser.rows.length) {
            await client.query('ROLLBACK');
            return { ok: false, message: 'Je hebt deze fiets al geboekt.' };
        }

        const bike = rowToBike(row);
        const totalPrice = calculateTotalPrice(bike, days);

        await client.query(
            `INSERT INTO rentals (guest_id, bike_id, rental_date, return_date, status, total_price)
             VALUES ($1, $2, $3, $4, 'active', $5)`,
            [guestId, bikeId, startDate, endDate, totalPrice]
        );
        await client.query(`UPDATE bikes SET status = 'rented' WHERE id = $1`, [bikeId]);

        await client.query('COMMIT');
        return { ok: true, message: `${bike.name} geboekt voor ${days} dag(en).` };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Fout bij fiets huren:', error);
        return { ok: false, message: 'Verhuring kon niet worden opgeslagen.' };
    } finally {
        client.release();
    }
}

async function fetchRentalsForGuest(guestId: number): Promise<GuestBookingView[]> {
    const result = await pool.query<RentalRow>(
        `SELECT r.*, b.name AS bike_name, b.type AS bike_type
         FROM rentals r
         JOIN bikes b ON b.id = r.bike_id
         WHERE r.guest_id = $1
         ORDER BY r.rental_date DESC`,
        [guestId]
    );
    return result.rows.map(rentalRowToBooking);
}

// --- Gast: evenementen (nog in-memory via BikeRental) ---

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

export async function getGuestBookings(guestId: number): Promise<GuestBookingView[]> {
    const bikeBookings = await fetchRentalsForGuest(guestId);

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

export async function getGuestDashboard(guestId: number) {
    const all = await getGuestBookings(guestId);
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

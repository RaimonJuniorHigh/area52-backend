import pool from '../db/db';

export interface AdminGuestView {
    id: number;
    email: string;
    activeRentals: number;
    totalRentals: number;
}

export async function listGuestsForAdmin(): Promise<AdminGuestView[]> {
    const result = await pool.query<{
        id: number;
        email: string;
        active_rentals: string;
        total_rentals: string;
    }>(
        `SELECT u.id,
                u.email,
                COUNT(r.rental_id) FILTER (WHERE r.status IN ('reserved', 'active')) AS active_rentals,
                COUNT(r.rental_id) AS total_rentals
         FROM users u
         LEFT JOIN rentals r ON r.guest_id = u.id
         WHERE u.role = 'guest'
         GROUP BY u.id, u.email
         ORDER BY u.id`
    );

    return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        activeRentals: Number(row.active_rentals),
        totalRentals: Number(row.total_rentals),
    }));
}

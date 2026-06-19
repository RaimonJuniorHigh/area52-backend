import pool from '../db/db';
import { UserRole } from '../types/auth';

export interface AdminUserView {
    id: number;
    email: string;
    role: UserRole;
}

export async function listUsersForAdmin(role?: UserRole): Promise<AdminUserView[]> {
    const result = role
        ? await pool.query<{ id: number; email: string; role: UserRole }>(
              'SELECT id, email, role FROM users WHERE role = $1 ORDER BY id',
              [role]
          )
        : await pool.query<{ id: number; email: string; role: UserRole }>(
              'SELECT id, email, role FROM users ORDER BY id'
          );

    return result.rows;
}

export async function updateUserRole(
    userId: number,
    role: UserRole,
    actorId: number
): Promise<{ ok: boolean; error?: string }> {
    if (userId === actorId) {
        return { ok: false, error: 'Je kunt je eigen rol niet wijzigen.' };
    }
    if (role !== 'guest' && role !== 'admin') {
        return { ok: false, error: 'Ongeldige rol.' };
    }

    const user = await pool.query<{ id: number; role: UserRole }>(
        'SELECT id, role FROM users WHERE id = $1',
        [userId]
    );
    if (!user.rows.length) return { ok: false, error: 'Account niet gevonden.' };

    if (user.rows[0].role === 'admin' && role === 'guest') {
        const admins = await pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
        if (admins.rows[0].count <= 1) {
            return { ok: false, error: 'Er moet minimaal één admin overblijven.' };
        }
    }

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    return { ok: true };
}

export async function deleteUser(
    userId: number,
    actorId: number
): Promise<{ ok: boolean; error?: string }> {
    if (userId === actorId) {
        return { ok: false, error: 'Je kunt je eigen account niet verwijderen.' };
    }

    const user = await pool.query<{ id: number; role: UserRole }>(
        'SELECT id, role FROM users WHERE id = $1',
        [userId]
    );
    if (!user.rows.length) return { ok: false, error: 'Account niet gevonden.' };

    if (user.rows[0].role === 'admin') {
        const admins = await pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
        if (admins.rows[0].count <= 1) {
            return { ok: false, error: 'De laatste admin kan niet worden verwijderd.' };
        }
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return { ok: true };
}

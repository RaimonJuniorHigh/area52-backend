import pool from '../db/db';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type FacilityCategory =
    | 'zwembad'
    | 'supermarkt'
    | 'restaurant'
    | 'fietsverhuur'
    | 'activiteit';

export interface DayHours {
    open: string | null;
    close: string | null;
}

export type WeeklyHours = Record<DayKey, DayHours>;

export interface Facility {
    id: number;
    name: string;
    category: FacilityCategory;
    description: string;
    icon: string;
    sortOrder: number;
    weeklyHours: WeeklyHours;
    isOpenNow: boolean;
}

export const FACILITY_CATEGORIES: FacilityCategory[] = [
    'zwembad',
    'supermarkt',
    'restaurant',
    'fietsverhuur',
    'activiteit',
];

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_LABELS: Record<DayKey, string> = {
    mon: 'Ma',
    tue: 'Di',
    wed: 'Wo',
    thu: 'Do',
    fri: 'Vr',
    sat: 'Za',
    sun: 'Zo',
};

const JS_DAY_TO_KEY: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

interface FacilityRow {
    id: number;
    name: string;
    category: string;
    description: string;
    icon: string;
    sort_order: number;
    weekly_hours: WeeklyHours;
}

function emptyWeeklyHours(): WeeklyHours {
    return {
        mon: { open: null, close: null },
        tue: { open: null, close: null },
        wed: { open: null, close: null },
        thu: { open: null, close: null },
        fri: { open: null, close: null },
        sat: { open: null, close: null },
        sun: { open: null, close: null },
    };
}

function normalizeWeeklyHours(raw: unknown): WeeklyHours {
    const base = emptyWeeklyHours();
    if (!raw || typeof raw !== 'object') return base;
    for (const day of DAY_KEYS) {
        const entry = (raw as Record<string, DayHours>)[day];
        if (entry && typeof entry === 'object') {
            base[day] = {
                open: entry.open || null,
                close: entry.close || null,
            };
        }
    }
    return base;
}

function isOpenNow(weeklyHours: WeeklyHours, now = new Date()): boolean {
    const dayKey = JS_DAY_TO_KEY[now.getDay()];
    const hours = weeklyHours[dayKey];
    if (!hours?.open || !hours?.close) return false;

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function rowToFacility(row: FacilityRow): Facility {
    const weeklyHours = normalizeWeeklyHours(row.weekly_hours);
    return {
        id: row.id,
        name: row.name,
        category: row.category as FacilityCategory,
        description: row.description,
        icon: row.icon,
        sortOrder: row.sort_order,
        weeklyHours,
        isOpenNow: isOpenNow(weeklyHours),
    };
}

export async function listFacilities(): Promise<Facility[]> {
    const result = await pool.query<FacilityRow>(
        'SELECT * FROM facilities ORDER BY sort_order ASC, id ASC'
    );
    return result.rows.map(rowToFacility);
}

export async function getFacilityById(id: number): Promise<Facility | undefined> {
    const result = await pool.query<FacilityRow>('SELECT * FROM facilities WHERE id = $1', [id]);
    return result.rows[0] ? rowToFacility(result.rows[0]) : undefined;
}

export async function createFacility(data: {
    name: string;
    category: FacilityCategory;
    description?: string;
    icon?: string;
    weeklyHours?: WeeklyHours;
}): Promise<Facility | { error: string }> {
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!FACILITY_CATEGORIES.includes(data.category)) return { error: 'Ongeldige categorie.' };

    const maxOrder = await pool.query<{ max: number | null }>(
        'SELECT MAX(sort_order) AS max FROM facilities'
    );
    const sortOrder = (maxOrder.rows[0].max ?? 0) + 1;

    const result = await pool.query<FacilityRow>(
        `INSERT INTO facilities (name, category, description, icon, sort_order, weekly_hours)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            data.name.trim(),
            data.category,
            data.description?.trim() || '',
            data.icon || '📍',
            sortOrder,
            JSON.stringify(normalizeWeeklyHours(data.weeklyHours)),
        ]
    );
    return rowToFacility(result.rows[0]);
}

export async function updateFacility(
    id: number,
    data: {
        name: string;
        category: FacilityCategory;
        description?: string;
        icon?: string;
        weeklyHours?: WeeklyHours;
    }
): Promise<Facility | { error: string }> {
    const existing = await getFacilityById(id);
    if (!existing) return { error: 'Locatie niet gevonden.' };
    if (!data.name?.trim()) return { error: 'Naam is verplicht.' };
    if (!FACILITY_CATEGORIES.includes(data.category)) return { error: 'Ongeldige categorie.' };

    const result = await pool.query<FacilityRow>(
        `UPDATE facilities
         SET name = $1, category = $2, description = $3, icon = $4, weekly_hours = $5
         WHERE id = $6
         RETURNING *`,
        [
            data.name.trim(),
            data.category,
            data.description?.trim() ?? existing.description,
            data.icon ?? existing.icon,
            JSON.stringify(normalizeWeeklyHours(data.weeklyHours ?? existing.weeklyHours)),
            id,
        ]
    );
    return rowToFacility(result.rows[0]);
}

export async function deleteFacility(id: number): Promise<{ ok: boolean; error?: string }> {
    const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return { ok: false, error: 'Locatie niet gevonden.' };
    return { ok: true };
}

export async function reorderFacilities(ids: number[]): Promise<{ ok: boolean; error?: string }> {
    if (!ids.length) return { ok: false, error: 'Geen volgorde opgegeven.' };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < ids.length; i++) {
            await client.query('UPDATE facilities SET sort_order = $1 WHERE id = $2', [i + 1, ids[i]]);
        }
        await client.query('COMMIT');
        return { ok: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Fout bij hersorteren:', error);
        return { ok: false, error: 'Volgorde kon niet worden opgeslagen.' };
    } finally {
        client.release();
    }
}

export { emptyWeeklyHours, normalizeWeeklyHours, isOpenNow };

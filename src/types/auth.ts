// ==========================================
// AUTH TYPES - AREA52
// Doel: Gedeelde typen voor JWT en gebruikersrollen.
// ==========================================

export type UserRole = 'guest' | 'admin';

export interface JwtPayload {
    id: number;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

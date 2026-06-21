// Gedeelde JWT-configuratie — één bron voor login, middleware en Cloud Run.
export function getJwtSecret(): string {
    return process.env.JWT_SECRET || 'super_geheime_area52_sleutel_123';
}

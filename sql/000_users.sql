-- Gebruikers (guestId in rentals = users.id)
-- Uitvoeren in Cloud SQL Studio op database area52_db

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'guest'
);

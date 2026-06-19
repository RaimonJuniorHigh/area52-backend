-- Fietsen tabel voor Area52 fietsverhuur
-- Uitvoeren in Cloud SQL Studio op database area52_db (na 000_users.sql)

CREATE TABLE IF NOT EXISTS bikes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    deposit NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
);

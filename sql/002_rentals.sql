-- Verhuur (guest_id verwijst naar users.id)
-- Uitvoeren in Cloud SQL Studio op database area52_db (na 001_bikes.sql)

DO $$ BEGIN
    CREATE TYPE rental_status AS ENUM ('reserved', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS rentals (
    rental_id SERIAL PRIMARY KEY,
    guest_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bike_id INT NOT NULL REFERENCES bikes(id) ON DELETE RESTRICT,
    rental_date DATE NOT NULL,
    return_date DATE,
    status rental_status NOT NULL DEFAULT 'reserved',
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rentals_guest_id ON rentals(guest_id);
CREATE INDEX IF NOT EXISTS idx_rentals_bike_id ON rentals(bike_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

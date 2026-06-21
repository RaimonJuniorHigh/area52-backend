-- Locaties / openingstijden voor parkfaciliteiten
-- Uitvoeren in Cloud SQL Studio op database area52_db

CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon VARCHAR(20) NOT NULL DEFAULT '📍',
    sort_order INT NOT NULL DEFAULT 0,
    weekly_hours JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_facilities_sort_order ON facilities(sort_order);

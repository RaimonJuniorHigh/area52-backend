-- Startdata fietsen (alleen als tabel leeg is)
-- Uitvoeren in Cloud SQL Studio op database area52_db (na 001_bikes.sql)

INSERT INTO bikes (name, type, price_per_day, deposit, image_url, status)
SELECT * FROM (VALUES
    ('Fontana',     'racebike',      35, 200, '/bike-images/Fontana.webp',     'available'),
    ('Gazelle',     'electric bike', 28, 150, '/bike-images/Gazelle.webp',     'available'),
    ('Batavus',     'bike',          12,  50, '/bike-images/Batavus.webp',     'available'),
    ('Giant',       'mountainbike',  30, 175, '/bike-images/Giant.webp',       'available'),
    ('Specialized', 'racebike',      40, 250, '/bike-images/Specialized.webp', 'available'),
    ('Trek',        'mountainbike',  32, 180, '/bike-images/Trek.webp',        'available'),
    ('Cortina',     'bike',          15,  60, '/bike-images/Cortina.webp',     'available'),
    ('Koga',        'electric bike', 30, 150, '/bike-images/Koga.webp',        'available'),
    ('Merida',      'mountainbike',  28, 170, '/bike-images/Merida.webp',      'available'),
    ('Raleigh',     'bike',          18,  80, '/bike-images/Raleigh.webp',     'available')
) AS seed(name, type, price_per_day, deposit, image_url, status)
WHERE NOT EXISTS (SELECT 1 FROM bikes LIMIT 1);

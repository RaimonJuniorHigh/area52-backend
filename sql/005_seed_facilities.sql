-- Startdata openingstijden (alleen als tabel leeg is)

INSERT INTO facilities (name, category, description, icon, sort_order, weekly_hours)
SELECT * FROM (VALUES
    ('Zwembad Area52', 'zwembad', 'Binnen- en buitenzwembad met glijbaan.', '🏊', 1,
     '{"mon":{"open":"10:00","close":"20:00"},"tue":{"open":"10:00","close":"20:00"},"wed":{"open":"10:00","close":"20:00"},"thu":{"open":"10:00","close":"20:00"},"fri":{"open":"10:00","close":"21:00"},"sat":{"open":"09:00","close":"21:00"},"sun":{"open":"09:00","close":"19:00"}}'::jsonb),
    ('Parkwinkel', 'supermarkt', 'Dagelijkse boodschappen, snacks en ijs.', '🛒', 2,
     '{"mon":{"open":"08:00","close":"20:00"},"tue":{"open":"08:00","close":"20:00"},"wed":{"open":"08:00","close":"20:00"},"thu":{"open":"08:00","close":"20:00"},"fri":{"open":"08:00","close":"21:00"},"sat":{"open":"08:00","close":"21:00"},"sun":{"open":"09:00","close":"18:00"}}'::jsonb),
    ('Restaurant De Eik', 'restaurant', 'Hollandse gerechten en kindermenu.', '🍽️', 3,
     '{"mon":{"open":null,"close":null},"tue":{"open":"17:00","close":"22:00"},"wed":{"open":"17:00","close":"22:00"},"thu":{"open":"17:00","close":"22:00"},"fri":{"open":"17:00","close":"23:00"},"sat":{"open":"12:00","close":"23:00"},"sun":{"open":"12:00","close":"21:00"}}'::jsonb),
    ('Restaurant Het Meer', 'restaurant', 'Vis en grill met terras aan het water.', '🐟', 4,
     '{"mon":{"open":null,"close":null},"tue":{"open":"12:00","close":"21:00"},"wed":{"open":"12:00","close":"21:00"},"thu":{"open":"12:00","close":"21:00"},"fri":{"open":"12:00","close":"22:00"},"sat":{"open":"12:00","close":"22:00"},"sun":{"open":"12:00","close":"20:00"}}'::jsonb),
    ('Restaurant Smullerij', 'restaurant', 'Pizza, pasta en snelle bites.', '🍕', 5,
     '{"mon":{"open":"11:00","close":"21:00"},"tue":{"open":"11:00","close":"21:00"},"wed":{"open":"11:00","close":"21:00"},"thu":{"open":"11:00","close":"21:00"},"fri":{"open":"11:00","close":"22:00"},"sat":{"open":"11:00","close":"22:00"},"sun":{"open":"11:00","close":"20:00"}}'::jsonb),
    ('Fietsverhuur', 'fietsverhuur', 'Stadfietsen, e-bikes en mountainbikes.', '🚲', 6,
     '{"mon":{"open":"09:00","close":"18:00"},"tue":{"open":"09:00","close":"18:00"},"wed":{"open":"09:00","close":"18:00"},"thu":{"open":"09:00","close":"18:00"},"fri":{"open":"09:00","close":"19:00"},"sat":{"open":"09:00","close":"19:00"},"sun":{"open":"10:00","close":"17:00"}}'::jsonb),
    ('Boogschieten', 'activiteit', 'Begeleide sessies voor beginners en gevorderden.', '🎯', 7,
     '{"mon":{"open":null,"close":null},"tue":{"open":"10:00","close":"17:00"},"wed":{"open":"10:00","close":"17:00"},"thu":{"open":"10:00","close":"17:00"},"fri":{"open":"10:00","close":"18:00"},"sat":{"open":"09:00","close":"18:00"},"sun":{"open":"09:00","close":"16:00"}}'::jsonb),
    ('Klimparcours', 'activiteit', 'Avontuurlijk klimmen in de bossen.', '🧗', 8,
     '{"mon":{"open":null,"close":null},"tue":{"open":"10:00","close":"18:00"},"wed":{"open":"10:00","close":"18:00"},"thu":{"open":"10:00","close":"18:00"},"fri":{"open":"10:00","close":"19:00"},"sat":{"open":"09:00","close":"19:00"},"sun":{"open":"09:00","close":"17:00"}}'::jsonb),
    ('Jeu de boules', 'activiteit', 'Petanquebanen — materiaal te leen bij de balie.', '⚽', 9,
     '{"mon":{"open":"09:00","close":"20:00"},"tue":{"open":"09:00","close":"20:00"},"wed":{"open":"09:00","close":"20:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"21:00"},"sat":{"open":"09:00","close":"21:00"},"sun":{"open":"09:00","close":"20:00"}}'::jsonb)
) AS seed(name, category, description, icon, sort_order, weekly_hours)
WHERE NOT EXISTS (SELECT 1 FROM facilities LIMIT 1);

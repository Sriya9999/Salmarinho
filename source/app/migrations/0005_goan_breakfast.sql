-- Goan Breakfast: a section made from Goan dishes already on the menu (Ross
-- omelette, Portuguese omelette, choris on toast). Prices are unchanged.
INSERT OR IGNORE INTO menu_categories (slug, title, subtitle, story, mood, image, image_alt, icon, sort) VALUES ('goan-breakfast', 'Goan Breakfast', 'Goan and Portuguese favourites', 'The Goan side of the morning: an omelette with xacuti curry, smoked choris, and omelettes served with char-grilled poi.', 'ember', '/assets/v2/menu/goan-breakfast.webp', 'A Ross omelette in Goan xacuti curry with lime and soft poi', 'pan', 2);
UPDATE menu_categories SET sort = 1 WHERE slug = 'south-indian-breakfast';
UPDATE menu_categories SET sort = 2 WHERE slug = 'goan-breakfast';
UPDATE menu_categories SET sort = 3 WHERE slug = 'morning-classics';
UPDATE menu_categories SET sort = 4 WHERE slug = 'eggs-and-omelettes';
UPDATE menu_categories SET sort = 5 WHERE slug = 'buddha-bowls';
UPDATE menu_categories SET sort = 6 WHERE slug = 'add-your-protein';
UPDATE menu_categories SET sort = 7 WHERE slug = 'french-toast';
UPDATE menu_categories SET sort = 8 WHERE slug = 'coffee-and-tea';
UPDATE menu_categories SET sort = 9 WHERE slug = 'fresh-juices-and-shakes';
UPDATE menu_categories SET sort = 10 WHERE slug = 'signature-smoothies';
UPDATE dishes SET category = 'goan-breakfast', sort = 1, featured = 1, image = '/assets/v2/dishes/ross-omelette.webp', image_alt = 'An omelette in Goan xacuti curry with lime and soft poi' WHERE id = 'dish-ross-omelette';
UPDATE dishes SET category = 'goan-breakfast', sort = 2, featured = 1, image = '/assets/v2/dishes/portuguese-omelette.webp', image_alt = 'A folded omelette with smoked choris, herbs and onion jam' WHERE id = 'dish-portuguese-omelette';
UPDATE dishes SET category = 'goan-breakfast', sort = 3, featured = 0, image = '', image_alt = '' WHERE id = 'dish-choris-on-toast';
-- Masala chai keeps its photo; the homepage features thirteen dishes.
UPDATE dishes SET featured = 0 WHERE id = 'dish-masala-chai';

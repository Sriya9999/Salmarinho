-- Digital menu: "new" and "sold out" flags for each dish (chef's special is
-- chef_recommendation), and vegetarian marks read from each dish's ingredients.
ALTER TABLE dishes ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0;
ALTER TABLE dishes ADD COLUMN sold_out INTEGER NOT NULL DEFAULT 0;
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-benne-dosa';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-mushroom-paneer-ghee-roast-benne-dosa';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-mushroom-paneer-chettinad-benne-dosa';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-ulundu-bonda';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-clay-pot-tatte-idli';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-butter-podi-clay-pot-tatte-idli';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-herbed-garlic-butter-clay-pot-tatte-idli';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-ghee-shallow-fried';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-appe-masala';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-south-indian-breakfast';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-udupi-uppit';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-sheera';
UPDATE dishes SET dietary = '["Vegan"]' WHERE id = 'dish-vegan-buddha-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-chimichurri-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-sweet-potato-chickpeas-buddha-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-fajita-buddha-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-miso-mushroom-buddha-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-mixed-sprouts-buddha-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-yogurt-muesli-bowl';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-paneer';
UPDATE dishes SET dietary = '["Vegetarian"]' WHERE id = 'dish-tofu';

-- Crab journey field notes for the journal.
INSERT OR IGNORE INTO journal_posts (id, slug, title, category, excerpt, cover, cover_alt, body, author, published_at, published) VALUES ('post-crab-boxes', 'field-notes-the-boxes-beside-the-restaurant', 'Field notes: the boxes beside the restaurant', 'The crab', 'Our crab project lives a few steps from the kitchen, one crab to a box. How it works while it grows.', '/assets/v2/journal/crab-boxes.webp', 'Rows of blue crab boxes along a wall beside the restaurant', 'Our crab cultivation project is underway, and it is closer to the kitchen than you might think: the farm sits right beside the restaurant.

## One crab, one box

The crabs are brought in from where we source them and settled into rows of boxes, one crab to each.

## The same fish, for up to three months

We feed them the same fish for up to three months. It is slow, careful work, and it is what builds the meat inside the shell.

## Coming soon

None of this is on the menu yet. When it is, you will be able to choose your crab and tell the chef how you would like it cooked. Until then, we will keep posting notes here as the project grows.', 'The Sal Marinho kitchen', '2026-10-05', 1);
INSERT OR IGNORE INTO journal_posts (id, slug, title, category, excerpt, cover, cover_alt, body, author, published_at, published) VALUES ('post-why-fattened', 'why-crab-tastes-different-when-its-fattened', 'Why crab tastes different when it''s fattened', 'The crab', 'A freshly moulted crab is mostly water and promise. Patience is what turns it into something worth waiting for.', '/assets/v2/journal/crab-salt.webp', 'A mud crab on dark slate scattered with coarse salt', 'Every mud crab grows by leaving its shell behind. It swells, splits the old armour and walks out soft. For a while after that moult the new shell is roomy, and the crab inside it is light and thin on meat.

Fattening is the answer the coast arrived at long ago. Instead of rushing a light crab to the pot, it is kept, fed well and left to fill out its new shell.

## What changes

A fattened crab has dense, sweet meat that comes away from the shell in whole pieces. The claws are packed tight, and the juices that run when it meets the fire are richer.

## How you can tell

Weight is the first clue: a good crab feels heavier than it looks. Press the underside and it should feel firm, not hollow.

> It is slower, and it asks more of everyone involved.

It is also why our crab is still in its boxes and not yet on the menu. Coming soon.', 'The Sal Marinho kitchen', '2026-10-04', 1);

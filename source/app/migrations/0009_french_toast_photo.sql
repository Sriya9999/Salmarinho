-- The French toast photo was of pancakes; replace it with French toast.
UPDATE dishes
SET image = '/assets/v2/dishes/classic-french-toast-2.webp',
    image_alt = 'Two thick slices of golden French toast dusted with icing sugar, with a little pot of syrup'
WHERE id = 'dish-classic-french-toast';

UPDATE menu_categories
SET image = '/assets/v2/menu/french-toast-2.webp',
    image_alt = 'Two thick slices of golden French toast dusted with icing sugar, with syrup on a white plate'
WHERE slug = 'french-toast';

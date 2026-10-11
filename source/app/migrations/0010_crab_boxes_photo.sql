-- The field notes cover was a blurry video frame; use the team's photograph of the crab boxes.
UPDATE journal_posts
SET cover = '/assets/v2/journal/crab-boxes-2.webp',
    cover_alt = 'In black and white: a man lifting a mud crab from one of the numbered crab boxes stacked along a wall beside the restaurant'
WHERE id = 'post-crab-boxes';

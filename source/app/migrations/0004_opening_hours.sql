-- Opening hours: every day, 8 am to 1:30 pm and 6 pm to 10 pm. Other site
-- settings are kept as they are; the hours stay editable in /admin.
INSERT INTO settings (key, value) VALUES ('site', json_object('hours', json('[{"days":"Every day","open":"8:00 am","close":"1:30 pm"},{"days":"Every day","open":"6:00 pm","close":"10:00 pm"}]')))
  ON CONFLICT(key) DO UPDATE SET value = json_set(value, '$.hours', json('[{"days":"Every day","open":"8:00 am","close":"1:30 pm"},{"days":"Every day","open":"6:00 pm","close":"10:00 pm"}]'));

-- Copy that mentioned afternoon hours, now that the kitchen rests between sittings.
UPDATE journal_posts SET excerpt = 'Dosa at noon, eggs for dinner, coffee whenever. A small argument for eating breakfast on your own time.', body = 'Somewhere along the way breakfast acquired a deadline. Order before eleven, or the kitchen moves on.

By the sea, days keep a different time. Some mornings start at dawn with the fishing boats; some start at noon after a late night. Neither deserves a lesser plate.

## Breakfast, all day

So breakfast stays on the menu from the moment we open to the moment we close, morning and evening. Idli at one in the afternoon. A masala omelette at nine at night. Coffee whenever you would like another.

> The best meal of the day should not depend on what time you woke up.' WHERE id = 'post-no-clock';
UPDATE menu_categories SET story = 'Coffee, chai and tea, from the first cup of the morning to the last of the evening.' WHERE slug = 'coffee-and-tea';

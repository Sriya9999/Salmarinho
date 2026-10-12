-- Opening hours: 8 am to 8 pm, closed on Wednesdays. Other site settings are
-- kept as they are; the hours stay editable in /admin.
INSERT INTO settings (key, value) VALUES ('site', json_object('hours', json('[{"days":"Thursday to Tuesday","open":"8:00 am","close":"8:00 pm"},{"days":"Wednesday","open":"Closed","close":""}]')))
  ON CONFLICT(key) DO UPDATE SET value = json_set(value, '$.hours', json('[{"days":"Thursday to Tuesday","open":"8:00 am","close":"8:00 pm"},{"days":"Wednesday","open":"Closed","close":""}]'));

-- Copy that mentioned eating at nine at night, now that the last table is earlier.
UPDATE journal_posts
SET body = REPLACE(body, 'from the moment we open to the moment we close, morning and evening. Idli at one in the afternoon. A masala omelette at nine at night.', 'from the moment we open to the moment we close. Idli at one in the afternoon. A masala omelette at seven in the evening.')
WHERE id = 'post-no-clock';

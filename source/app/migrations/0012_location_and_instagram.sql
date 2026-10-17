-- Where Sal Marinho is and its Instagram, for the site and for Google: the
-- Google Maps pin by Starco Junction (De Mello Vaddo, Anjuna 403509) and
-- @salmarinhogoa. Only fills fields the owner has not set in /admin.
UPDATE settings
SET value = json_set(
  value,
  '$.address', CASE WHEN COALESCE(json_extract(value, '$.address'), '') = '' THEN 'Near Starco Junction, De Mello Vaddo, Anjuna, Goa 403509' ELSE json_extract(value, '$.address') END,
  '$.mapsUrl', CASE WHEN COALESCE(json_extract(value, '$.mapsUrl'), '') = '' THEN 'https://www.google.com/maps/search/?api=1&query=Sal%20Marinho%20Anjuna' ELSE json_extract(value, '$.mapsUrl') END,
  '$.instagram', CASE WHEN COALESCE(json_extract(value, '$.instagram'), '') = '' THEN 'https://www.instagram.com/salmarinhogoa/' ELSE json_extract(value, '$.instagram') END
)
WHERE key = 'site';

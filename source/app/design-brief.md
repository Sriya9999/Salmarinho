# Sal Marinho: design brief

Source: the owner's PRD ("Immersive Motion-Graphic Website for a Coastal Gastronomy Restaurant").
Restaurant: Sal Marinho, Goa. Crab-fattening gastronomy, coastal Indian cuisine, Portuguese
influence, wood fire and hibachi-style cooking, claypot and cast-iron service.

## Design read
For diners in Goa (travellers and locals) choosing a special evening. Register: tropical, earthy,
mysterious, luxurious, primitive yet sophisticated. It must feel like walking into the restaurant,
not browsing a restaurant template.

## Concept spine
**A journey from the coast to the fire.** The site is a tasting menu served in five courses:
COAST, CRAB, FIRE, CLAY, TABLE. Every page is a course; every animation is fire, water, smoke,
steam, waves or discovery. Narrative spine (reference-boards pick): journey / waypoints.

## Delivery tier
`spectacle`: Lenis + GSAP, the scroll-scrub film as Tier-1, custom ember cursor in fire sections,
WebGL smoke transition as the second beat. Brief explicitly asks for an immersive cinematic film.

## Locked palette (owner's explicit brand colors, PRD section 5)
The PRD names charcoal/volcanic black, forest and leaf green, burnt terracotta, clay, sand, bone,
smoked brown and a sparing ocean blue. That is the owner's brand, so it overrides the generic
"near-black + ember accent" and "cream + clay" bans. Defense: the colors are literally the
restaurant's materials (volcanic stone, charcoal, clay pots, sand, banana leaf).

| token | hex | role |
|---|---|---|
| volcanic | `#141311` | page ground |
| charcoal | `#1E1C19` | raised surfaces |
| smoked | `#4A3426` | warm dividers, map ink |
| forest | `#1F2E24` | green ground for coast/land chapters |
| leaf | `#3E5A3A` | foliage tints, never text |
| terracotta | `#A8502F` | THE single accent (CTAs, active states, ember, large type) |
| terracotta-deep | `#8F4227` | same accent, darker step for fills that carry small text |
| clay | `#B8805A` | secondary warm text accents on dark |
| sand | `#D9C6A5` | muted body ink |
| bone | `#EFE7DA` | primary ink |
| ocean | `#1D4250` | mood ground only (sea dishes, coast), never a UI accent |

One theme: dark throughout; sections tint-shift between volcanic, charcoal, forest and ocean
grounds. Text: bone on volcanic 15.1:1, sand on volcanic 11.1:1, clay on volcanic 5.6:1. Terracotta is for
large type and fills; small bone labels sit on terracotta-deep (5.8:1), never on terracotta (4.4:1).

## Locked type (owner instruction: "use the logo and logo's font")
- Brand name: always the owner's traced logo (`/assets/brand/wordmark.svg`, script) with the wave
  mark (`/assets/brand/mark.svg`); never re-typeset.
- Display: **Cinzel** (the face of "ANJUNA" in the logo) for headings, statements, menu
  categories and nav labels; set with open tracking. Serif justified: it is the owner's own logo
  typeface.
- Script accent: **WindSong** (closest open match to the logo's signature script), used sparingly
  for one or two short flourishes per page at large sizes, never for body or UI.
- Text/UI: **Satoshi** for body, prices, ingredients, forms and utility info (PRD: minimal sans).

## Combinatorial pick (held across all boards)
- Theme paradigm: Deep Dark with a material twist (volcanic stone, clay, leaf green, not graphite).
- Background character: full-bleed cinematic imagery + tactile clay/paper grain.
- Typography character: editorial serif + sans pairing.
- Hero architecture: massive image-first with restrained text (the film).
- Section system: poster-stacked storytelling.
- Signature components: layered image crop frames; hover-accordion slices (menu); vertical rhythm
  lines (the fattening ritual rail); off-grid editorial (journal).
- Second-read moment: one macro crop carrying the brand color (terracotta crab shell, full bleed).

## Animation mode
Animation mode: animated-website

### Journey block (scroll-scrub, references/scroll-scrub.md)
- **Journey shape:** `multi-leg`, 5 legs. Justified: the PRD's story crosses five distinct places
  (shoreline, the catch, the fire pit, the claypot, the table), not one subject seen closer.
- **Camera architecture:** A (continuous forward flight, grounded realistic world). Each leg starts
  from the previous leg's actual last rendered frame. No connectors.
- **Journey (scene, focal point, headline, sentence, tags):**
  1. COAST: low camera gliding over wet sand at blue hour toward a woven fishing basket at the tide
     line, wooden boats soft in the haze. Focal: the basket. "From the coast." / "Every story here
     begins at the water, with the tide and the morning catch."
  2. CRAB: the camera arrives at the basket; a dark mud crab, shell glistening, is lifted by
     weathered hands; drift continues past it toward a warm glow in the dark. Focal: the crab.
     "Not simply caught." / "We fatten our crab, nurture it, and bring it to the fire only when
     it's ready." Tags: Fattened, Curated, Prepared.
  3. FIRE: forward into a wood fire pit; flames rise, embers float, a blackened claypot sits on
     glowing coals. Focal: the flame. "Through the fire." / "Before refrigeration and before
     machinery, there was fire. We still cook with it."
  4. CLAY: close on the claypot; the lid lifts, steam blooms and fills the frame. Focal: the lid.
     "Sealed in clay." / "Claypot and cast iron hold the heat, the aroma and the character of the
     dish."
  5. TABLE: through the steam to the finished crab dish in its claypot on a dark wood table,
     natural stone wall and tropical leaves behind, candlelight. Focal: the dish. "To your table."
     / "Fresh meat. Ancient fire. Served differently."
- **World grammar preamble (byte-identical in every prompt):** "Cinematic 35mm film, shallow depth
  of field, low-key natural light, deep volcanic-black shadows, warm ember highlights in burnt
  terracotta #A8502F, sand #D9C6A5 midtones, forest green #1F2E24 in the shadows, subtle film
  grain, locked exposure and white balance, slow steady forward camera drift, no cuts, no camera
  shake, no text, no logos, no watermark."
- **Seam direction:** always forward and slightly descending; each leg's final second settles into
  the same slow forward drift.
- **Mobile framing:** focal points held in the center third; mobile encodes cap at 720p from the
  same 16:9 source with center object-position; no separate portrait source unless a crop fails.
- **Delivery budget:** desktop clips total <= 32 MiB, mobile clips total <= 16 MiB.
- **How the journey enacts the spine:** scrolling is literally walking from the tide line to the
  table; reverse scroll walks you back to the sea.

## Anti-convergence ledger
First website build in this session: no previous build to diverge from. Axes recorded for the
next build: palette family volcanic + terracotta + forest; type Cinzel + WindSong + Satoshi; hero = multi-leg
scroll film; Tier-1 = A4 scroll scrub; CTA garments listed below; corner language = sharp (0px),
hairline rules.

## Section plan: homepage (`/`)
Families never repeat consecutively; 9 distinct families over 12 sections. Eyebrow budget 4.
1. **Journey film** (A4 scroll scrub, 5 chapters above). Family: full-bleed film. Eyebrow 1:
   "Sal Marinho, Goa" on chapter 1 only.
2. **Philosophy**: "Not another seafood restaurant." Oversized centered statement, two short
   lines of copy. Family: manifesto statement.
3. **The fattening ritual**: vertical rhythm-line rail, 7 waypoints (Coast, Selection, Fattening,
   Preparation, Fire, Clay, Table), each with a macro crop that slides in. Family: process rail.
   Eyebrow 2: "The crab".
4. **The coast**: pinned horizontal pan across India's coastline (Konkan, Goa, Malabar, Coromandel,
   the Portuguese ports) with wave-drift parallax; mobile = swipe strip. Family: horizontal pan.
5. **The fire**: full-bleed fire plate with ember cursor, "Cooked the old way. Served a new way."
   Family: full-bleed media band.
6. **What's cooking?**: hover-accordion slices of the 8 journey categories; each slice opens with
   its mood ground (ocean for sea, charcoal for fire...) and, when dishes exist, the signature
   dishes. Family: accordion slices. Eyebrow 3: "Menu".
7. **The Portuguese connection**: old-map route art Portugal to India's coast, 5 waypoints along a
   drawn route. Family: map diagram.
8. **The claypot**: layered crop frames; the lid layer lifts on scroll and steam rises.
   Family: layered crop frames.
9. **The experience**: "Come for the crab. Stay for the story." 8 moments as a filmstrip of tall
   frames (Arrive to Stay a little longer). Family: filmstrip.
10. **Journal**: off-grid editorial spread, one large lead story and two offset. Family: off-grid
    editorial. Eyebrow 4: "From our kitchen journal".
11. **The restaurant**: diagonal staggered masonry of interior and atmosphere photos. Family:
    masonry gallery.
12. **Reservation**: "The fire is lit." Giant display type with the fire film masked into the
    letters, then the reservation chit CTA. Family: typographic CTA band.
Footer: address/hours/contact only when filled in the admin.

## Inner pages (each a course; one hero visual + 3 to 6 sections, families varied)
- `/who-we-are` The Story Behind the Spice: 4 chapters (Coast, Crab, Fire, Table) as alternating
  poster frames, closing line "This isn't just where we cook. It's where the coast comes alive."
- `/menu` What's Cooking?: category page-turn tabs, dish cards as story cards (origin, influence,
  technique, ingredients, pairing, price), hover fire glow + mood ground; `/menu/$slug` dish story.
- `/the-crab` The Fattening Ritual: documentary-style 7-step sequence with macro plates and a
  scrubbed crab clip.
- `/coastal-journey` Coastal Cuisine: region by region horizontal journey plus ingredients strip.
- `/our-craft` From Coast to Fire: 4 chapters (Coast, Hand, Fire, Vessel) + "The table".
- `/portuguese-connection`: Portugal, coastal trade, India, local ingredients, modern
  interpretation along an animated route.
- `/journal` + `/journal/$slug`: magazine layout, 6 categories as filters.
- `/the-experience`: Arrive, Discover, Choose, Watch the fire, Smell the smoke, Lift the claypot,
  Taste, Stay a little longer.
- `/visit` Find Your Way to the Table: stylized Goa coastline map with animated route to the pin,
  hours, contact, parking, directions; fields hidden until filled in the admin.
- `/reserve`: full-screen minimal form (date, time, guests, special request, confirm).
- `/admin`: password-protected content editor (dishes, categories, journal, events, settings,
  photos, reservations inbox).

## Asset plan
- Owner photos (attached later) win for dishes, crab, interiors, team, logo; re-graded only if
  they clash.
- Film: 1 entry still (2 candidates) + 5 legs, Seedance 2.5, 1080p, ~6s each, audio off. Legs are
  reused as inner-page scrub bands (fire on Our Craft, crab on The Crab, coast on Coastal Journey).
- Stills (GPT Image 2.5): ritual macros (7), coast regions (5), fire plate, claypot layers (pot +
  lid pair), experience moments (8), journal covers (5), interior/atmosphere (6, until owner
  photos arrive), ingredients (6), Portuguese route map + azulejo-derived pattern, section plates
  (clay grain, charred wood), 404 and reservation-confirmed state art.
- Custom icon set (one sheet, 1.5px line glyphs: crab, wave, flame, claypot, cast-iron pan,
  coconut, chilli, leaf, fish, shell, clock, pin), background-removed.
- Brand: wordmark + monogram (only if the owner has no logo), head kit, OG cards per major route,
  launch cover. Optional ambient sound (fire + waves), muted by default.

## CTA inventory (each its own component and interaction identity; one label per intent)
- **Reserve your table** (nav, persistent): ember pill with inertia; the ember inside brightens
  toward the cursor. The only pill on the site.
- **Enter the experience** (chapter 1): text link whose arrow travels along a drawn wave line,
  jumps to chapter 2.
- **Follow the ritual** (ritual section): circular badge, text set on a path around a crab-shell
  glyph, unrolls on hover.
- **Discover the dish** (menu slices): whole slice shears and shifts to its fire-glow grade.
- **Trace the route** (Portuguese section): arrow travels along the dotted trade route.
- **Read the journal** (journal): underline is a shoreline waveform that ripples on hover.
- **Get directions** (visit): corner-bracket viewfinder closes around the label.
- **Reserve your table** (closing band): kitchen order chit with perforation that tears on hover.
- **Confirm** (reservation form): wax-seal stamp press on :active.
Rationed garments (draw underline / flood-fill / framed block): none used.

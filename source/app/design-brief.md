# Sal Marinho, Anjuna: design brief (v2, "An imagined coast")

## Position
A coastal restaurant in Anjuna serving South Indian food, all-day breakfast, coffee and
beverages. The site sells what is on the table now: the visitor reaches **What's cooking?**
within one scroll. Crab is a future chapter only (cultivation underway), never on the landing
page or in the hero, always labelled Coming soon.

## Concept spine
**An imagined coast.** Water, fire, food, table. The site is a place you enter at first light
and leave in the evening: darkness and a shimmer of water, a single crackle, warm glow, the room
emerging, breakfast on the table. Atmospheric, warm, slightly surreal; colour used sparingly.

Not: a resort, Goa tourism, seafood, a vintage or traditional South Indian restaurant, cartoon,
corporate. Not the printed menu: none of its waves, botanical drawings, sketch illustration,
cream paper, bold black headings or layout.

## Palette (tokens in `src/site.css`)
| Token | Hex | Role |
| --- | --- | --- |
| charcoal | `#161513` | base ground |
| smoke | `#2A2420` | smoky brown panels |
| sand | `#D8C7A9` | secondary text, hairlines |
| cream | `#F1E8D8` | primary text |
| clay | `#9C4A2E` | burnt clay, large accents, fills |
| terracotta | `#B86A4B` | muted terracotta, large text and marks only |
| ember | `#D88A64` | small accent text (contrast-safe on charcoal) |
| olive | `#4F5232` | deep olive panels |
| jungle | `#1E2B22` | dark tropical green panels |
| ocean | `#1F4552` | ocean blue, coast and water moments |

Colour appears as light: a warm glow, a strip of ocean, a clay plate. Most surfaces stay dark.

## Type
- **Boska** (Fontshare): contemporary high-contrast serif for headlines; italic for emphasis.
- **General Sans** (Fontshare): body, menu items, prices, UI.
- **Kalnia** (OFL): the one expressive display face, used sparingly (What's cooking?, Something
  is growing, Come to the table). Light weight, large.
- The restaurant's logo mark and wordmark remain the signature in header and footer.

## Graphic devices (original to this site)
Topographic coastal contour lines that drift and redraw; abstract waveform lines (oscilloscope,
not illustration); water-ripple displacement on images; smoke textures as section transitions;
slow spice particles; minimal botanical silhouettes as shadow, not drawings; architectural
outlines (arches, columns, roof lines) drawn as single hairlines; organic blob masks for images.

## Motion
Normal vertical scroll only. Parallax, slow camera moves, masked reveals, smoke and water
transitions, particles, text reveals, image scaling, cursor drift, sticky sections. No horizontal
or forced scroll, no swipe or drag storytelling. Reduced motion: the whole story as stills.

## Sound
Off by default, discreet Sound on / Sound off. Waves bed (opening, coast), single crackle
(opening), fire bed (fire section), quiet over the menu. Crossfaded by section.

Animation mode: animated-website

## Journey scenes
Camera architecture: A (grounded, realistic, continuous forward drift)
- Opening film (time-based intro, 2 legs, seam-locked): night water with a faint shimmer, a
  small fire glows on stone, the room emerges at first light, breakfast on a table, steam.
- Section 02 scroll film: a clock on a sunlit table becomes a breakfast plate; its hands become
  streams of coffee; light crosses morning to afternoon (start and end frames fixed).
- Section 05 scroll film: land, water, food (stone path, shoreline, salt, a plate by the water).
- Loops: fire macro (embers, cast iron, clay), restaurant camera move, mangrove water (crab
  chapter).
Byte budget: 32 MiB desktop, 16 MiB mobile across all films.

## Section plan (homepage)
| # | Section | Layout family | Motion |
| --- | --- | --- | --- |
| 0 | Opening | full-bleed film | time-based, skippable |
| H | Hero: A little coastal magic, all day. | full-bleed image, bottom-left type | slow light, steam |
| 01 | What's cooking? | editorial grid + category tabs | masked image reveals |
| 02 | Breakfast doesn't have a clock | sticky scroll film | scrub |
| 03 | From the South | asymmetric macro collage | parallax, particles |
| 04 | Follow the spice | dark field of floating ingredients | cursor / scroll focus |
| 05 | The coast is in everything | sticky scroll film + copy | scrub, ripple |
| 06 | A little Portuguese in the coast | abstract contour map | line draws on scroll |
| 07 | Some things taste better with fire | dark full-bleed loop | smoke out |
| 08 | Come in. Stay awhile. | slow camera band + detail strip | parallax |
| 09 | From our kitchen journal | magazine spread | image scale |
| 10 | Something is growing (Coming soon) | small, quiet band | water ripple |
| F | Come to the table | evening image + details | glow |

## CTA inventory (each with its own interaction)
- What's cooking? (hero primary): text with a steam line that rises on hover.
- Discover Sal Marinho (hero secondary): hairline underline that traces like a contour.
- View full menu: a folded-corner tab that lifts.
- Category tabs: dot that slides under the active tab.
- Read the story (journal): image zoom and arrow.
- Coming soon (crab): ripple ring on hover.
- Reserve / Visit us: the ember pill, restyled.
- Sound on / off: waveform glyph that flattens when off.

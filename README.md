# Sal Marinho: website assets

All of the visual and audio assets created for the Sal Marinho website (Anjuna, Goa).
Live site: https://salmarinho.higgsfield.app

## Folders

### `website/`: the files the live site uses, web-optimised

| Folder | What's inside |
| --- | --- |
| `assets/world/` | The homepage scroll film in five chapters (coast, crab, fire, clay, table). Each chapter has a desktop and a lighter mobile version, plus a still of its first frame. |
| `assets/photos/` | Photos used across the pages, colour-graded to the brand palette. `photos/owner/` holds the restaurant's own photos (dishes, the chef at the fire, the garden statue); the other folders are generated. |
| `assets/art/` | Illustrations and textures: Portugal-to-India route map, Goa coast map, azulejo tile pattern, clay and charred plates, ingredient cut-outs, and the loader's gate artwork (cut from the restaurant's own gate illustration). |
| `assets/og/` | Link-preview images for each page (what shows when the site is shared on WhatsApp, Instagram and so on). |
| `assets/brand/` | The logo mark, wordmark and "Anjuna" lettering, traced from the restaurant's logo as SVG. |
| `assets/icons/` | The site's custom line icons (crab, wave, flame, claypot and others). |
| `assets/audio/` | The ambient fire-and-waves soundtrack (off until a visitor turns it on). |
| `icons/`, `site.webmanifest` | Browser tab icon, phone home-screen icons and app manifest. |

### `generated/`: full-quality originals, as generated

| Folder | What's inside |
| --- | --- |
| `boards/` | 15 design reference boards, one per homepage section and key page. |
| `images/` | 42 original images at full resolution. The site uses web-sized versions of these. |
| `images/film-start/` | Two candidate opening frames for the film. `entry-b.png` is the one the film starts from. |
| `film/` | The five original 1080p film clips before web encoding. Each clip starts on the previous clip's last frame, so they play as one continuous shot. |
| `contact-sheets/` | Overview sheets for browsing the images at a glance. |
| `prompts/` | The prompt behind every generated file, as tab-separated tables that open in Excel or Google Sheets. |

## How they were made

- Images and design boards: GPT Image 2.5 on Higgsfield.
- Film: Seedance 2.5 on Higgsfield, five 6-second clips chained frame to frame.
- Ambient sound: Seed Audio 1.0 on Higgsfield.

The restaurant's own photos, gate illustration and logo are not AI-generated. The graded photos the site uses are in `website/assets/photos/owner/`, the gate artwork is in `website/assets/art/`, and the logo tracings are in `website/assets/brand/`.

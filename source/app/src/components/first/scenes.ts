/**
 * The original landing film, scrubbed by scroll: COAST, CRAB, FIRE, CLAY, TABLE.
 *
 * Multi-leg, architecture A (design brief): each leg starts from the previous
 * leg's actual last rendered frame. Every `poster` is the exact first frame of
 * the encoded clip beside it.
 *
 * Keep this array a module constant. Changing its identity on every render
 * intentionally rebuilds the media controller.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the journey layer (design brief palette). */
export const firstTheme: ScrollScrubTheme = {
  accent: "#A8502F",
  background: "#141311",
  ink: "#EFE7DA",
  muted: "#D9C6A5",
};

const leg = (n: number) => ({
  clip: `/assets/world/leg-${n}.mp4`,
  mobileClip: `/assets/world/leg-${n}-mobile.mp4`,
  poster: `/assets/world/leg-${n}-poster.jpg`,
  mobilePoster: `/assets/world/leg-${n}-mobile-poster.jpg`,
});

export const firstScenes: ScrollScrubScene[] = [
  {
    ...leg(1),
    id: "the-coast",
    sound: "waves",
    label: "Coast",
    kicker: "Sal Marinho, Anjuna",
    title: "From the coast.",
    body: "Every story here begins at the water, with the tide and the morning catch.",
    scroll: 1.7,
    linger: 0.15,
  },
  {
    ...leg(2),
    id: "the-crab",
    sound: "crab",
    label: "Crab",
    title: "Not simply caught.",
    body: "We fatten our crab, nurture it, and bring it to the fire only when it's ready.",
    tags: ["Fattened", "Curated", "Prepared"],
    align: "right",
    scroll: 1.6,
    linger: 0.2,
  },
  {
    ...leg(3),
    id: "the-fire",
    sound: "fire",
    label: "Fire",
    title: "Through the fire.",
    body: "Fire was the first kitchen. We never saw a reason to move out.",
    scroll: 1.6,
    linger: 0.2,
  },
  {
    ...leg(4),
    id: "the-clay",
    sound: "fire",
    label: "Clay",
    title: "Sealed in clay.",
    body: "Claypot and cast iron hold the heat, the aroma and the character of the dish.",
    align: "right",
    scroll: 1.5,
    linger: 0.2,
  },
  {
    ...leg(5),
    id: "the-table",
    sound: "restaurant",
    label: "Table",
    title: "To your table.",
    body: "Fresh meat. Ancient fire. Served differently.",
    scroll: 1.7,
    linger: 0.25,
  },
];

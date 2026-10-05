/**
 * Theme for the scroll films on the homepage (sections 02 and 05). Their scene
 * data lives beside the sections in components/v2/home.tsx; every poster there
 * is the exact first frame of the encoded clip beside it.
 */
import type { ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the film layer (design brief palette). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#D88A64",
  background: "#161513",
  ink: "#F1E8D8",
  muted: "#D8C7A9",
};

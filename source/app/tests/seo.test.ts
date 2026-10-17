import { expect, test } from "bun:test";

import { DEFAULT_SETTINGS } from "../src/lib/content/seed";
import { eventSchema, pageHead, postalAddress, restaurantSchema } from "../src/lib/seo";
import { OPENING_HOURS, hoursSentence } from "../src/lib/site";

test("inner pages carry a breadcrumb trail from home", () => {
  const head = pageHead({ title: "Menu", description: "d", path: "/menu", crumb: "Menu" });
  const trail = JSON.parse(head.scripts[0].children);
  expect(trail["@type"]).toBe("BreadcrumbList");
  expect(trail.itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Menu"]);
  expect(pageHead({ title: "Home", description: "d", path: "/" }).scripts).toEqual([]);
});

test("page titles end with the site name and fit Google's 60 characters", () => {
  const head = pageHead({ title: "South Indian and Goan breakfast in Anjuna", description: "d", path: "/breakfast" });
  const title = head.meta.find((m) => "title" in m)?.title ?? "";
  expect(title).toBe("South Indian and Goan breakfast in Anjuna | Sal Marinho");
  expect(title.length).toBeLessThanOrEqual(60);
});

test("event times typed in the admin panel become India Standard Time", () => {
  const event = { id: "e", title: "Supper", date: "2026-11-02", time: "7.30 pm", description: "", image: "", published: true };
  expect(eventSchema(event).startDate).toBe("2026-11-02T19:30:00+05:30");
  expect(eventSchema({ ...event, time: "" }).startDate).toBe("2026-11-02");
});

test("hours read as one sentence for descriptions", () => {
  expect(hoursSentence(OPENING_HOURS)).toBe("Open Thursday to Tuesday, 8:00 am to 8:00 pm. Closed Wednesday.");
});

test("the restaurant always names its village, even before a street address is set", () => {
  const data = restaurantSchema({ ...DEFAULT_SETTINGS, address: "" }) as { address: Record<string, string> };
  expect(data.address.addressLocality).toBe("Anjuna");
  expect(data.address.streetAddress).toBeUndefined();
});

test("a written-out address is split into street, village and PIN code for Google", () => {
  expect(postalAddress({ address: "Near Starco Junction, De Mello Vaddo, Anjuna, Goa 403509" })).toEqual({
    "@type": "PostalAddress",
    streetAddress: "Near Starco Junction, De Mello Vaddo",
    addressLocality: "Anjuna",
    addressRegion: "Goa",
    postalCode: "403509",
    addressCountry: "IN",
  });
});

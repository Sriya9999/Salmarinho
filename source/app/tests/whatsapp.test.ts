import { expect, test } from "bun:test";

import { BOOKING_SAMPLES, BOOKING_TEMPLATE, ENQUIRY_SAMPLES, ENQUIRY_TEMPLATE } from "../src/lib/notify/templates";
import { GRAPH_API, sendTemplate, templateValues, toWhatsAppNumber } from "../src/lib/notify/whatsapp.server";

const blanks = (template: string) => template.match(/\{\{\d+\}\}/g)?.length ?? 0;

const booking = { kind: "booking" as const, name: "Asha Naik", date: "2026-10-23", time: "13:00", guests: 4, phone: "+91 98765 43210", request: "" };
const enquiry = {
  kind: "enquiry" as const,
  name: "Rohan Dias",
  eventType: "Birthday",
  eventDate: "14 December",
  location: "Villa in Assagao",
  guests: 30,
  phone: "+91 98765 43210",
  email: "rohan@example.com",
};

test("alert phone numbers become WhatsApp IDs, with India's code when missing", () => {
  expect(toWhatsAppNumber("+91 98765 43210")).toBe("919876543210");
  expect(toWhatsAppNumber("98765 43210")).toBe("919876543210");
  expect(toWhatsAppNumber("098765 43210")).toBe("919876543210");
  expect(toWhatsAppNumber("0091 98765 43210")).toBe("919876543210");
  expect(toWhatsAppNumber("+44 7700 900123")).toBe("447700900123");
});

test("each template's blanks match the values the site fills in", () => {
  expect(blanks(BOOKING_TEMPLATE)).toBe(templateValues(booking).length);
  expect(blanks(ENQUIRY_TEMPLATE)).toBe(templateValues(enquiry).length);
  expect(BOOKING_SAMPLES).toHaveLength(blanks(BOOKING_TEMPLATE));
  expect(ENQUIRY_SAMPLES).toHaveLength(blanks(ENQUIRY_TEMPLATE));
});

test("booking values read naturally and are never empty or multi-line", () => {
  expect(templateValues(booking)).toEqual(["4", "Friday 23 October 2026", "1:00 pm", "Asha Naik", "+91 98765 43210", "None"]);
  expect(templateValues({ ...booking, request: "High chair,\n\tplease   and thanks" })[5]).toBe("High chair, please and thanks");
});

test("a template message goes to the Cloud API with the token and filled blanks", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  const fetcher = (async (url: string, init: RequestInit) => {
    seen = { url, init };
    return new Response(JSON.stringify({ messages: [{ id: "wamid.x" }] }), { status: 200 });
  }) as unknown as typeof fetch;
  const result = await sendTemplate({ phoneNumberId: "123456", token: "secret", language: "en" }, "919876543210", "new_reservation", ["4"], fetcher);
  expect(result.ok).toBe(true);
  expect(seen!.url).toBe(`${GRAPH_API}/123456/messages`);
  expect((seen!.init.headers as Record<string, string>).Authorization).toBe("Bearer secret");
  const body = JSON.parse(String(seen!.init.body));
  expect(body).toMatchObject({
    messaging_product: "whatsapp",
    to: "919876543210",
    type: "template",
    template: { name: "new_reservation", language: { code: "en" }, components: [{ type: "body", parameters: [{ type: "text", text: "4" }] }] },
  });
});

test("WhatsApp errors are explained in plain words", async () => {
  const fetcher = (async () =>
    new Response(JSON.stringify({ error: { code: 132001, message: "Template name does not exist in the translation" } }), { status: 404 })) as unknown as typeof fetch;
  const result = await sendTemplate({ phoneNumberId: "1", token: "t", language: "en" }, "91", "nope", [], fetcher);
  expect(result.ok).toBe(false);
  expect(result.detail).toContain("cannot find that template");
});

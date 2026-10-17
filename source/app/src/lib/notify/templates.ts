// The WhatsApp message templates the owner creates once in WhatsApp Manager.
// Their numbered blanks are filled, in order, by templateValues() in
// whatsapp.server.ts; a test checks that the counts match.

export const BOOKING_TEMPLATE =
  "New table booking at Sal Marinho for {{1}} guests on {{2}} at {{3}}. Name: {{4}}. Phone: {{5}}. Request: {{6}}. Open the admin panel to confirm it.";
export const BOOKING_SAMPLES = ["4", "Friday 23 October 2026", "1:00 pm", "Asha Naik", "+91 98765 43210", "Window table"];

export const ENQUIRY_TEMPLATE =
  "New event enquiry at Sal Marinho: {{1}} for {{2}} guests, {{3}}, at {{4}}. Name: {{5}}. Phone: {{6}}. Email: {{7}}. Open the admin panel to reply.";
export const ENQUIRY_SAMPLES = ["Birthday", "30", "14 December 2026", "Villa in Assagao", "Rohan Dias", "+91 98765 43210", "rohan@example.com"];

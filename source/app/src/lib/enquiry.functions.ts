import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { getDb, getSettings } from "@/lib/content/db.server";
import { hashValue } from "@/lib/crypto.server";
import { enquirySchema } from "@/lib/enquiry-schema";

export type EnquiryResult = { ok: true; whatsapp: string | null } | { ok: false; message: string };

/**
 * Event enquiries are saved to the database and read by the team in /admin.
 * Without a database there is nowhere for an enquiry to go, so the form says
 * so plainly instead of pretending it was sent.
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const db = await getDb();
    const settings = await getSettings();
    const contact = settings.events.enquiryEmail || settings.email;
    if (!db) {
      return {
        ok: false,
        message: contact
          ? `Online enquiries are not connected yet. Please write to us at ${contact}.`
          : "Online enquiries are not connected yet. Please call or message the restaurant.",
      };
    }

    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "unknown";
    const ipHash = await hashValue(`enquiry:${ip}`);
    const recent = await db
      .prepare("SELECT COUNT(*) AS n FROM event_enquiries WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')")
      .bind(ipHash)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= 5) {
      return { ok: false, message: "We have received several enquiries from you already. We'll be in touch shortly." };
    }

    await db
      .prepare(
        `INSERT INTO event_enquiries (id, name, email, phone, event_type, event_date, location, guests, message, status, ip_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .bind(crypto.randomUUID(), data.name, data.email, data.phone, data.eventType, data.eventDate, data.location, data.guests, data.message, ipHash)
      .run();

    // Optionally continue the conversation on WhatsApp, prefilled.
    const number = (settings.events.enquiryWhatsapp || settings.whatsapp).replace(/[^\d]/g, "");
    const text = `Hello Sal Marinho, I've just sent an event enquiry.\nName: ${data.name}\nEvent: ${data.eventType}\nWhen: ${data.eventDate}\nWhere: ${data.location}\nGuests: ${data.guests}`;
    return { ok: true, whatsapp: number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null };
  });

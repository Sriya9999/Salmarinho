import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { getDb, getSettings } from "@/lib/content/db.server";
import { hashValue } from "@/lib/crypto.server";

const reservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(24).regex(/^[+\d][\d\s()-]{5,23}$/),
  request: z.string().trim().max(600).default(""),
  // Honeypot: real visitors never see or fill this.
  website: z.string().max(0).default(""),
});

export type ReservationResult =
  | { ok: true; handoff: { kind: "whatsapp" | "external"; url: string } | null }
  | { ok: false; message: string };

function whatsappLink(number: string, text: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const submitReservation = createServerFn({ method: "POST" })
  .validator(reservationSchema)
  .handler(async ({ data }): Promise<ReservationResult> => {
    const today = new Date().toISOString().slice(0, 10);
    if (data.date < today) return { ok: false, message: "Please choose a date from today onwards." };

    const settings = await getSettings();
    const db = await getDb();
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "unknown";
    const ipHash = await hashValue(`reserve:${ip}`);

    if (db) {
      const recent = await db
        .prepare("SELECT COUNT(*) AS n FROM reservations WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')")
        .bind(ipHash)
        .first<{ n: number }>();
      if ((recent?.n ?? 0) >= 5) {
        return { ok: false, message: "We have received several requests from you already. We'll be in touch shortly." };
      }
      await db
        .prepare(
          "INSERT INTO reservations (id, date, time, guests, name, phone, request, status, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)",
        )
        .bind(crypto.randomUUID(), data.date, data.time, data.guests, data.name, data.phone, data.request, ipHash)
        .run();
    } else if (!settings.reservationUrl && !settings.whatsapp) {
      return { ok: false, message: "Reservations are not open online yet. Please call the restaurant." };
    }

    if (settings.reservationUrl) return { ok: true, handoff: { kind: "external", url: settings.reservationUrl } };
    if (settings.whatsapp) {
      const text = `Hello Sal Marinho, I'd like to reserve a table.\nName: ${data.name}\nDate: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}${data.request ? `\nRequest: ${data.request}` : ""}`;
      return { ok: true, handoff: { kind: "whatsapp", url: whatsappLink(settings.whatsapp, text) } };
    }
    return { ok: true, handoff: null };
  });

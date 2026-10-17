// WhatsApp alerts to the restaurant's own phones for new bookings and event
// enquiries, sent through the official WhatsApp Business Platform (Cloud API).
//
// WhatsApp only lets a business start a conversation with a message template
// that Meta has approved, so each alert fills the numbered blanks of a template
// the owner creates once in WhatsApp Manager (the wording is shown in /admin).
// The settings, including the access token, live in the database row
// 'whatsapp-alerts'. They are edited in /admin and never sent to the browser.
import { getDb } from "@/lib/content/db.server";
import { formatTime, weekdayOf } from "@/lib/site";

/** Meta supports each Graph API version for about two years. */
export const GRAPH_API = "https://graph.facebook.com/v23.0";

const CONFIG_KEY = "whatsapp-alerts";
const STATUS_KEY = "whatsapp-alerts-status";

export interface AlertSettings {
  /** Send an alert for every new table booking. */
  bookings: boolean;
  /** Send an alert for every new event enquiry. */
  enquiries: boolean;
  /** Phones to alert, digits only with the country code. */
  recipients: string[];
  /** From WhatsApp Manager: the business number's "Phone number ID". */
  phoneNumberId: string;
  /** A permanent (system user) access token with whatsapp_business_messaging. */
  token: string;
  bookingTemplate: string;
  enquiryTemplate: string;
  /** The template's language code in WhatsApp Manager, "en" for English. */
  language: string;
}

export interface AlertStatus {
  at: string;
  ok: boolean;
  detail: string;
}

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  bookings: false,
  enquiries: false,
  recipients: [],
  phoneNumberId: "",
  token: "",
  bookingTemplate: "new_reservation",
  enquiryTemplate: "new_event_enquiry",
  language: "en",
};

export type Alert =
  | { kind: "booking"; name: string; date: string; time: string; guests: number; phone: string; request: string }
  | {
      kind: "enquiry";
      name: string;
      eventType: string;
      eventDate: string;
      location: string;
      guests: number;
      phone: string;
      email: string;
    };

/** Digits only. A bare ten-digit Indian mobile number gets India's 91. */
export function toWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "").replace(/^00/, "");
  if (/^0?[6-9]\d{9}$/.test(digits)) return `91${digits.slice(-10)}`;
  return digits;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-10-23" to "Friday 23 October 2026". */
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return MONTHS[m - 1] ? `${weekdayOf(iso)} ${d} ${MONTHS[m - 1]} ${y}` : iso;
}

/** Template values may not be empty or hold new lines, tabs or runs of spaces. */
export const templateText = (value: string) =>
  value.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 400) || "None";

/** The template's numbered blanks, in order. The wording is in /admin. */
export function templateValues(alert: Alert): string[] {
  if (alert.kind === "booking") {
    return [String(alert.guests), longDate(alert.date), formatTime(alert.time), alert.name, alert.phone, alert.request].map(templateText);
  }
  return [alert.eventType, String(alert.guests), alert.eventDate, alert.location, alert.name, alert.phone, alert.email].map(templateText);
}

/** What Meta's error codes mean for the owner, in plain words. */
function explain(error: { code?: number; message?: string; error_data?: { details?: string } } | undefined, status: number): string {
  switch (error?.code) {
    case 190:
      return "WhatsApp did not accept the access token. It may have expired: paste a new permanent token.";
    case 100:
      return `WhatsApp rejected the request. Check the phone number ID. (${error.error_data?.details ?? error.message ?? "invalid parameter"})`;
    case 131030:
      return "This phone is not on the test number's list of allowed recipients. Add it in WhatsApp Manager, or use your own business number.";
    case 131026:
      return "WhatsApp could not deliver the message. Check that the alert number uses WhatsApp.";
    case 132000:
      return "The template has a different number of blanks. Copy the wording from this page exactly.";
    case 132001:
      return "WhatsApp cannot find that template. Check its name and language, and that Meta has approved it.";
    case 131047:
      return "WhatsApp only allows templates for this message. Check the template name.";
    default:
      return error?.message ? `WhatsApp said: ${error.message}` : `WhatsApp did not answer as expected (HTTP ${status}).`;
  }
}

/** Sends one approved template to one phone. Never throws. */
export async function sendTemplate(
  settings: Pick<AlertSettings, "phoneNumberId" | "token" | "language">,
  to: string,
  template: string,
  values: string[],
  fetcher: typeof fetch = fetch,
): Promise<{ ok: boolean; detail: string }> {
  try {
    const response = await fetcher(`${GRAPH_API}/${encodeURIComponent(settings.phoneNumberId)}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: settings.language },
          components: [{ type: "body", parameters: values.map((text) => ({ type: "text", text })) }],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return { ok: true, detail: `Sent to +${to}.` };
    const body = (await response.json().catch(() => null)) as { error?: Parameters<typeof explain>[0] } | null;
    return { ok: false, detail: explain(body?.error, response.status) };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return { ok: false, detail: timedOut ? "WhatsApp did not answer in time." : "Could not reach WhatsApp." };
  }
}

// ---------------------------------------------------------------- storage

async function readJson<T>(key: string): Promise<Partial<T> | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  try {
    return row ? (JSON.parse(row.value) as Partial<T>) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Storage is not available in this environment.");
  await db
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(key, JSON.stringify(value))
    .run();
}

export async function getAlertSettings(): Promise<AlertSettings> {
  return { ...DEFAULT_ALERT_SETTINGS, ...(await readJson<AlertSettings>(CONFIG_KEY)) };
}

export const saveAlertSettings = (settings: AlertSettings) => writeJson(CONFIG_KEY, settings);

export async function getAlertStatus(): Promise<AlertStatus | null> {
  const status = await readJson<AlertStatus>(STATUS_KEY);
  return status?.at ? (status as AlertStatus) : null;
}

/** What the admin page may see: everything but the token itself. */
export function forAdmin(settings: AlertSettings) {
  const { token, ...rest } = settings;
  return { ...rest, tokenSaved: Boolean(token) };
}

// ---------------------------------------------------------------- sending

/** Sends an alert to every alert phone and records how it went. Never throws. */
export async function sendAlert(alert: Alert, options: { force?: boolean } = {}): Promise<AlertStatus> {
  const settings = await getAlertSettings().catch(() => DEFAULT_ALERT_SETTINGS);
  const wanted = alert.kind === "booking" ? settings.bookings : settings.enquiries;
  const at = new Date().toISOString();
  if (!wanted && !options.force) return { at, ok: true, detail: "Alerts are switched off." };
  if (!settings.phoneNumberId || !settings.token || !settings.recipients.length) {
    return { at, ok: false, detail: "Add the alert numbers, the phone number ID and the access token first." };
  }

  const template = alert.kind === "booking" ? settings.bookingTemplate : settings.enquiryTemplate;
  const values = templateValues(alert);
  const results = await Promise.all(settings.recipients.map((to) => sendTemplate(settings, to, template, values)));
  const failed = results.filter((r) => !r.ok);
  const status: AlertStatus = {
    at,
    ok: failed.length === 0,
    detail: failed.length ? failed[0].detail : results.map((r) => r.detail).join(" "),
  };
  await writeJson(STATUS_KEY, status).catch(() => {});
  return status;
}

/**
 * Lets the guest's page answer at once while the alert goes out: on Cloudflare
 * the Worker keeps running until the alert is sent.
 */
export async function inBackground(task: Promise<unknown>): Promise<void> {
  try {
    const workers = (await import("cloudflare:workers")) as { waitUntil?: (promise: Promise<unknown>) => void };
    if (workers.waitUntil) {
      workers.waitUntil(task);
      return;
    }
  } catch {
    // Not on Cloudflare: wait for it below.
  }
  await task;
}

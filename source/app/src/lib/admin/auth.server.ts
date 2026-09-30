// Server-only admin authentication: password login, hashed session tokens in
// D1, HttpOnly cookie, login throttling and a same-origin check for writes.
import { deleteCookie, getCookie, getRequestHeader, setCookie } from "@tanstack/react-start/server";

import { getDb, getEnv } from "@/lib/content/db.server";
import { hashPassword, hashValue, randomToken, timingSafeEqual, verifyPassword } from "@/lib/crypto.server";

const COOKIE = "sm_admin";
const SESSION_DAYS = 7;

export class AdminError extends Error {}

function assertSameOrigin() {
  const origin = getRequestHeader("origin");
  const host = getRequestHeader("host");
  if (!origin || !host) return;
  try {
    if (new URL(origin).host !== host) throw new AdminError("Cross-site request blocked.");
  } catch (error) {
    if (error instanceof AdminError) throw error;
    throw new AdminError("Cross-site request blocked.");
  }
}

async function storedPasswordHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").first<{ value: string }>();
  return row?.value ?? null;
}

export async function passwordConfigured(): Promise<boolean> {
  const env = await getEnv();
  return Boolean((await storedPasswordHash()) || env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD);
}

async function checkPassword(password: string): Promise<boolean> {
  const stored = await storedPasswordHash();
  if (stored) return verifyPassword(password, stored);
  const env = await getEnv();
  const initial = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  return Boolean(initial) && timingSafeEqual(password, initial as string);
}

export async function login(password: string): Promise<void> {
  assertSameOrigin();
  const db = await getDb();
  if (!db) throw new AdminError("The content database is not available here.");
  const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "unknown";
  const ipHash = await hashValue(`login:${ip}`);
  const recent = await db
    .prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip_hash = ? AND created_at > datetime('now', '-15 minutes')")
    .bind(ipHash)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= 6) throw new AdminError("Too many attempts. Please wait 15 minutes and try again.");

  if (!(await checkPassword(password))) {
    await db.prepare("INSERT INTO login_attempts (ip_hash) VALUES (?)").bind(ipHash).run();
    throw new AdminError("That password is not right.");
  }
  await db.prepare("DELETE FROM login_attempts WHERE ip_hash = ?").bind(ipHash).run();
  await db.prepare("DELETE FROM admin_sessions WHERE expires_at < datetime('now')").run();

  const token = randomToken();
  await db
    .prepare(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, datetime('now', '+${SESSION_DAYS} days'))`)
    .bind(await hashValue(token))
    .run();
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function isAdmin(): Promise<boolean> {
  const token = getCookie(COOKIE);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const db = await getDb();
  if (!db) return false;
  const row = await db
    .prepare("SELECT 1 AS ok FROM admin_sessions WHERE token_hash = ? AND expires_at > datetime('now')")
    .bind(await hashValue(token))
    .first<{ ok: number }>();
  return Boolean(row);
}

/** Guard for every admin read and write. Writes also require a same-origin request. */
export async function requireAdmin(opts: { write?: boolean } = {}): Promise<void> {
  if (opts.write) assertSameOrigin();
  if (!(await isAdmin())) throw new AdminError("Please sign in again.");
}

export async function logout(): Promise<void> {
  const token = getCookie(COOKIE);
  const db = await getDb();
  if (token && db) await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await hashValue(token)).run();
  deleteCookie(COOKIE, { path: "/" });
}

export async function changePassword(current: string, next: string): Promise<void> {
  await requireAdmin({ write: true });
  if (next.length < 10) throw new AdminError("Use at least 10 characters for the new password.");
  if (!(await checkPassword(current))) throw new AdminError("The current password is not right.");
  const db = await getDb();
  if (!db) throw new AdminError("The content database is not available here.");
  await db
    .prepare("INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(await hashPassword(next))
    .run();
  const token = getCookie(COOKIE);
  const keep = token ? await hashValue(token) : "";
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash != ?").bind(keep).run();
}

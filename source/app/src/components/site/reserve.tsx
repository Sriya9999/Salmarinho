import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import { submitReservation, type ReservationResult } from "@/lib/reserve.functions";
import { RESERVATION_SITTINGS, formatTime } from "@/lib/site";

type ReserveContextValue = { open: () => void; close: () => void; isOpen: boolean };
const ReserveContext = createContext<ReserveContextValue | null>(null);

export function useReserve(): ReserveContextValue {
  const ctx = useContext(ReserveContext);
  if (!ctx) throw new Error("useReserve must be used inside <ReserveProvider>");
  return ctx;
}

export function ReserveProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <ReserveContext.Provider value={value}>
      {children}
      <ReserveOverlay open={isOpen} onClose={close} />
    </ReserveContext.Provider>
  );
}

function ReserveOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("sm-locked");
    const first = dialog.current?.querySelector<HTMLElement>("input, select, textarea, button");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialog.current) {
        const nodes = dialog.current.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea");
        if (!nodes.length) return;
        const firstNode = nodes[0];
        const lastNode = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === firstNode) {
          event.preventDefault();
          lastNode.focus();
        } else if (!event.shiftKey && document.activeElement === lastNode) {
          event.preventDefault();
          firstNode.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("sm-locked");
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reserve-title"
      aria-hidden={!open}
      className="sm-reserve-overlay"
      data-open={open}
      inert={!open}
    >
      <div className="sm-reserve-overlay__ember" aria-hidden="true" />
      <button type="button" onClick={onClose} className="sm-reserve-overlay__close">
        <span className="sr-only">Close reservation</span>
        <span aria-hidden="true">Close</span>
      </button>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-24">
        {open ? <ReserveForm headingId="reserve-title" /> : null}
      </div>
    </div>
  );
}

function todayIso(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** The reservation form: date, time, guests, request, plus the name and phone we need to confirm. */
export function ReserveForm({ headingId, as: Heading = "h2" }: { headingId?: string; as?: "h1" | "h2" }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<ReservationResult, { ok: true }> | null>(null);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  useEffect(() => setMinDate(todayIso()), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setStatus("sending");
    try {
      const res = await submitReservation({
        data: {
          date: String(form.get("date") ?? ""),
          time: String(form.get("time") ?? ""),
          guests: Number(form.get("guests") ?? 2),
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          request: String(form.get("request") ?? ""),
          website: String(form.get("website") ?? ""),
        },
      });
      if (res.ok) {
        setResult(res);
        setStatus("done");
      } else {
        setError(res.message);
        setStatus("idle");
      }
    } catch {
      setError("Please check the date, time and phone number, then try again.");
      setStatus("idle");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="text-center" role="status">
        <img
          src="/assets/v2/table/garden-evening.webp"
          alt="Tables in the garden in the warm light of evening, lanterns in the trees"
          className="mx-auto mb-10 aspect-[16/9] w-full max-w-md object-cover"
        />
        <Heading id={headingId} className="sm-display text-3xl text-bone md:text-4xl">
          Your table is noted.
        </Heading>
        <p className="mx-auto mt-4 max-w-sm text-sand">
          {result.handoff?.kind === "whatsapp"
            ? "One last step: send us your request on WhatsApp so we can confirm your table."
            : result.handoff?.kind === "external"
              ? "One last step: confirm your table on our booking page."
              : "We have your request and will call to confirm your table."}
        </p>
        {result.handoff ? (
          <a
            href={result.handoff.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sm-handoff-link mt-8 inline-flex items-center gap-3 font-display text-lg tracking-[0.08em] text-bone"
          >
            {result.handoff.kind === "whatsapp" ? "Send on WhatsApp" : "Open booking page"}
            <span aria-hidden="true">&rarr;</span>
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="sm-reserve-form">
      <Heading id={headingId} className="sm-display text-center text-4xl text-bone md:text-5xl">
        Reserve your table
      </Heading>
      <p className="mx-auto mt-4 max-w-sm text-center text-sand">Tell us when you are coming and we will keep a table for you.</p>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Date" htmlFor={`${id}-date`}>
          <input id={`${id}-date`} name="date" type="date" required min={minDate} className="sm-input" />
        </Field>
        <Field label="Time" htmlFor={`${id}-time`}>
          <select id={`${id}-time`} name="time" required defaultValue="20:00" className="sm-input">
            {RESERVATION_SITTINGS.map((sitting) => (
              <optgroup key={sitting.label} label={sitting.label}>
                {sitting.times.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Guests" htmlFor={`${id}-guests`}>
          <select id={`${id}-guests`} name="guests" required defaultValue="2" className="sm-input">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name" htmlFor={`${id}-name`}>
          <input id={`${id}-name`} name="name" type="text" required autoComplete="name" maxLength={80} className="sm-input" />
        </Field>
        <Field label="Phone" htmlFor={`${id}-phone`} className="sm:col-span-2">
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            pattern="[+\d][\d\s()\-]{5,23}"
            className="sm-input"
          />
        </Field>
        <Field label="Special request" htmlFor={`${id}-request`} className="sm:col-span-2">
          <textarea id={`${id}-request`} name="request" rows={2} maxLength={600} className="sm-input resize-none" />
        </Field>
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-6 text-center text-sm text-clay">
          {error}
        </p>
      ) : null}
      <div className="mt-12 flex justify-center">
        <StampButton busy={status === "sending"} />
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="sm-label block">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Wax-seal stamp: presses in on :active like a seal on paper. */
function StampButton({ busy }: { busy: boolean }) {
  return (
    <button type="submit" disabled={busy} className="sm-stamp">
      <span className="sm-stamp__ring" aria-hidden="true" />
      <span className="relative">{busy ? "Sealing" : "Confirm"}</span>
    </button>
  );
}

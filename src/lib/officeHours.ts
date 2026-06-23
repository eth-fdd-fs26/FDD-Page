/**
 * Client for the Google Apps Script Web App that fronts the office-hours Sheet.
 *
 * Reads:   GET  → `{ ok: true, bookings: [...] }`.
 * Book:    POST `{ action: 'book',   date, time, name, email }` → `{ ok: true }`.
 * Cancel:  POST `{ action: 'cancel', date, time }`             → `{ ok: true }`.
 *
 * The POST uses `Content-Type: text/plain` on purpose: it keeps the request a
 * CORS "simple request" so the browser does not fire a preflight OPTIONS call
 * (Apps Script web apps do not answer preflights). The script reads the raw
 * body from `e.postData.contents` and JSON-parses it.
 */
import { OFFICE_HOURS_API_URL } from '../data/officeHours';

export interface Booking {
  /** ISO timestamp set server-side when the row was created. */
  timestamp: string;
  /** Slot date, ISO `YYYY-MM-DD`. */
  date: string;
  /** Slot start time, `HH:mm`. */
  time: string;
  name: string;
  email?: string;
}

export interface BookInput {
  date: string;
  time: string;
  name: string;
  email?: string;
}

/** Whether an Apps Script URL has been configured. */
export const isConfigured = (): boolean => OFFICE_HOURS_API_URL.trim().length > 0;

function ensureConfigured(): void {
  if (!isConfigured()) throw new Error('Office-hours booking is not configured yet.');
}

/** Fetch all current bookings. */
export async function fetchBookings(): Promise<Booking[]> {
  ensureConfigured();
  const res = await fetch(OFFICE_HOURS_API_URL, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`Could not load bookings (HTTP ${res.status}).`);
  const data: unknown = await res.json();
  if (!data || typeof data !== 'object' || !('bookings' in data)) {
    throw new Error('Unexpected response from the booking service.');
  }
  const list = (data as { bookings: unknown }).bookings;
  return Array.isArray(list) ? (list as Booking[]) : [];
}

async function post(body: Record<string, unknown>): Promise<void> {
  ensureConfigured();
  const res = await fetch(OFFICE_HOURS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Request failed (HTTP ${res.status}).`);
  const data: unknown = await res.json().catch(() => null);
  if (!data || typeof data !== 'object' || (data as { ok?: boolean }).ok !== true) {
    const message =
      data && typeof data === 'object' && typeof (data as { error?: string }).error === 'string'
        ? (data as { error: string }).error
        : 'The booking service rejected the request.';
    throw new Error(message);
  }
}

/** Book a slot. Throws (e.g. "That slot is already taken.") on failure. */
export function bookSlot(input: BookInput): Promise<void> {
  return post({ action: 'book', ...input });
}

/** Cancel whoever holds a slot. Anyone may cancel any slot. */
export function cancelSlot(date: string, time: string): Promise<void> {
  return post({ action: 'cancel', date, time });
}

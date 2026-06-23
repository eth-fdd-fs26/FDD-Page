/**
 * Office-hours booking configuration.
 *
 * Bookings are stored in a Google Sheet, fronted by a Google Apps Script Web
 * App (this site is static, so the browser cannot touch the Sheet directly).
 * See `google-apps-script/office-hours.gs` for the script and deploy steps,
 * then paste the deployed Web App URL into OFFICE_HOURS_API_URL below.
 *
 * The page shows one week at a time: a grid of the days below × the time slots
 * below. Each slot can be booked by one person, and anyone can cancel any slot.
 */
export const OFFICE_HOURS_API_URL =
  'https://script.google.com/macros/s/AKfycbzFR_LAAx-mjT2zu1GXyszyVeKmnqNrUDaAl50Sd42myiB-BExrB6ZM0CIlvKY6Kc7R/exec';

/** Weekdays offered each week (0 = Sunday … 6 = Saturday). Default: Mon/Wed/Fri. */
export const officeHourWeekdays: number[] = [1, 3, 5];

/** 30-minute slot start times ("HH:mm", 24h). Default: four slots, 18:00–20:00. */
export const officeHourTimes: string[] = ['18:00', '18:30', '19:00', '19:30'];

/** Monday (ISO `YYYY-MM-DD`) of the first bookable week. */
export const officeHourFirstMonday = '2026-06-22';

/** Number of consecutive weeks to offer from the first Monday. */
export const officeHourWeeks = 10;

/** Minutes per slot — used to render the end time. Keep in sync with the times above. */
export const SLOT_MINUTES = 30;

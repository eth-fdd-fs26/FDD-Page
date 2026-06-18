import { addDaysISO } from './date';
import type { CourseEvent } from '../data/calendar';

/** ISO `YYYY-MM-DD` -> `YYYYMMDD` (for all-day VALUE=DATE fields). */
const icsDate = (iso: string): string => iso.replace(/-/g, '');

/** Escape text per RFC 5545. */
const esc = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

const stamp = (): string =>
  new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

/**
 * Build a VCALENDAR string from the events. All events are all-day; `end` is
 * inclusive in our data, so DTEND is set to the day after (DTEND is exclusive
 * in iCalendar).
 */
export function buildICS(events: CourseEvent[]): string {
  const now = stamp();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FDD 2026//From Data to Decisions//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FDD 2026 — From Data to Decisions',
    'X-WR-TIMEZONE:Europe/Zurich',
  ];

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}@fdd2026`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${icsDate(ev.start)}`,
      `DTEND;VALUE=DATE:${icsDate(addDaysISO(ev.end, 1))}`,
      `SUMMARY:${esc(ev.title)}`,
    );
    if (ev.note) lines.push(`DESCRIPTION:${esc(ev.note)}`);
    lines.push(`CATEGORIES:${ev.type === 'deadline' ? 'Deadline' : 'Weekend'}`, 'END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  // RFC 5545 requires CRLF line endings.
  return lines.join('\r\n');
}

/** Trigger a download of the events as an .ics file. */
export function downloadICS(events: CourseEvent[], filename = 'fdd-2026.ics'): void {
  const blob = new Blob([buildICS(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** "Add to Google Calendar" template URL for a single event. */
export function googleCalendarUrl(ev: CourseEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${icsDate(ev.start)}/${icsDate(addDaysISO(ev.end, 1))}`,
  });
  if (ev.note) params.set('details', ev.note);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

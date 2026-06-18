import { weekends } from './weekends';
import { addDaysISO } from '../lib/date';

export type CourseEventType = 'weekend' | 'deadline';

export interface CourseEvent {
  uid: string;
  title: string;
  type: CourseEventType;
  /** Inclusive ISO start date. */
  start: string;
  /** Inclusive ISO end date (same as start for single-day events). */
  end: string;
  weekendId?: string;
  weekendNumber?: number;
  note?: string;
}

/** Weekend events, derived from the weekend data (Friday + Saturday). */
export const weekendEvents: CourseEvent[] = weekends.map((w) => ({
  uid: `fdd-${w.id}`,
  title: `FDD Weekend ${w.number} — ${w.title}`,
  type: 'weekend',
  start: w.startISO,
  end: addDaysISO(w.startISO, 1),
  weekendId: w.id,
  weekendNumber: w.number,
  note: w.theme,
}));

/**
 * Homework & projects. The Kaggle competition runs over several weeks; the rest
 * are single-day, scheduled on the Sunday right after their weekend.
 */
export const deadlines: CourseEvent[] = [
  {
    uid: 'fdd-hw-nuclear',
    title: 'Nuclear Power Plant Homework',
    type: 'deadline',
    start: '2026-06-28',
    end: '2026-06-28',
    note: 'Homework from Weekend 0.',
  },
  {
    uid: 'fdd-kaggle-start',
    title: 'Kaggle ML Competition — Start',
    type: 'deadline',
    start: '2026-07-12',
    end: '2026-07-12',
    note: 'Kaggle Machine Learning Competition starts (Sunday after Weekend 1).',
  },
  {
    uid: 'fdd-kaggle-end',
    title: 'Kaggle ML Competition — End',
    type: 'deadline',
    start: '2026-08-01',
    end: '2026-08-01',
    note: 'Kaggle Machine Learning Competition ends (Saturday after Weekend 3).',
  },
  {
    uid: 'fdd-project-we2',
    title: 'Project WE2',
    type: 'deadline',
    start: '2026-07-19',
    end: '2026-07-19',
    note: 'Project from Weekend 2.',
  },
  {
    uid: 'fdd-project-we3',
    title: 'Project WE3',
    type: 'deadline',
    start: '2026-07-26',
    end: '2026-07-26',
    note: 'Project from Weekend 3.',
  },
  {
    uid: 'fdd-project-we4',
    title: 'Project WE4',
    type: 'deadline',
    start: '2026-08-09',
    end: '2026-08-09',
    note: 'Project from Weekend 4.',
  },
  {
    uid: 'fdd-project-rag',
    title: 'Project RAG',
    type: 'deadline',
    start: '2026-08-16',
    end: '2026-08-16',
    note: 'Project from Weekend 5 (RAG).',
  },
  {
    uid: 'fdd-project-agentic',
    title: 'Project Agentic',
    type: 'deadline',
    start: '2026-08-23',
    end: '2026-08-23',
    note: 'Project from Weekend 6 (Agentic AI).',
  },
];

export const allEvents: CourseEvent[] = [...weekendEvents, ...deadlines].sort((a, b) =>
  a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
);

/** Months the course spans (year, 0-based month) — June, July, August 2026. */
export const calendarMonths: { year: number; month0: number }[] = [
  { year: 2026, month0: 5 },
  { year: 2026, month0: 6 },
  { year: 2026, month0: 7 },
];

/** All events overlapping a given ISO day. */
export function eventsOnDay(iso: string): CourseEvent[] {
  return allEvents.filter((e) => iso >= e.start && iso <= e.end);
}

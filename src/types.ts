export type SessionType = 'lecture' | 'exercise' | 'break' | 'project';

export type WeekendCategory = 'optional' | 'preparatory' | 'mandatory';

export interface Session {
  time: string;
  title: string;
  type: SessionType;
  /** Instructor / TA name(s) from the master spreadsheet, if assigned. */
  who?: string;
  /** Optional single link for this session (e.g. one notebook opened in Colab). */
  url?: string;
  /** Optional multiple labelled links, e.g. a multi-part exercise (Part 1 / Part 2). */
  links?: Resource[];
}

export interface Resource {
  label: string;
  url: string;
  /**
   * Optional sub-section heading on the weekend's Resources list, e.g.
   * "Exercises", "Lecture slides", "Homework". Resources sharing a group are
   * rendered together under that heading; groups appear in first-seen order.
   * Resources without a group render as a single flat list (default).
   */
  group?: string;
}

export interface Weekend {
  /** Stable slug used in the URL, e.g. "we3". */
  id: string;
  number: number;
  title: string;
  /** Short theme / subtitle. */
  theme: string;
  /** Human-readable date range, e.g. "26–27 June 2026". */
  dates: string;
  /** ISO date of the Friday the weekend starts on (Saturday is the next day). */
  startISO: string;
  /** Participation category — drives the coloured tag. */
  category: WeekendCategory;
  /** Project / homework assigned at this weekend, if any. */
  project?: string;
  /** Authored 1–2 sentence description of the weekend. */
  summary: string;
  /** Room / location for the Friday schedule, if known. */
  fridayRoom?: string;
  /** Room / location for the Saturday schedule, if known. */
  saturdayRoom?: string;
  friday: Session[];
  saturday: Session[];
  resources: Resource[];
}

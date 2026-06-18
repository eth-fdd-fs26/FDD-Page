import type { SessionType } from '../types';

const LABELS: Record<SessionType, string> = {
  lecture: 'Lecture',
  exercise: 'Coding Exercise',
  project: 'Project',
  break: 'Break',
};

export function SessionTypeChip({ type }: { type: SessionType }) {
  return <span className={`chip chip--${type}`}>{LABELS[type]}</span>;
}

export { LABELS as sessionTypeLabels };

import type { WeekendCategory } from '../types';

const LABELS: Record<WeekendCategory, string> = {
  optional: 'Entirely Optional',
  preparatory: 'Preparatory',
  mandatory: 'Mandatory',
};

export function CategoryBadge({ category }: { category: WeekendCategory }) {
  return <span className={`badge badge--${category}`}>{LABELS[category]}</span>;
}

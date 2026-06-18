import { Link } from 'react-router-dom';
import type { Weekend } from '../types';
import { CategoryBadge } from './CategoryBadge';

export function WeekendCard({ weekend }: { weekend: Weekend }) {
  return (
    <Link to={`/weekend/${weekend.id}`} className="wcard">
      <div className="wcard__top">
        <span className="wcard__num">Weekend {weekend.number}</span>
        <span className="wcard__dates">{weekend.dates}</span>
      </div>
      <h3 className="wcard__title">{weekend.title}</h3>
      <p className="wcard__theme">{weekend.theme}</p>
      <div style={{ marginBottom: 16 }}>
        <CategoryBadge category={weekend.category} />
      </div>
      <span className="wcard__cta">View schedule</span>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import type { Weekend } from '../types';
import { weekendRoom } from '../data/weekends';
import { CategoryBadge } from './CategoryBadge';
import { SchedulePeek } from './SchedulePeek';

export function WeekendCard({ weekend }: { weekend: Weekend }) {
  const room = weekendRoom(weekend);
  return (
    <Link to={`/weekend/${weekend.id}`} className="wcard">
      <div className="wcard__top">
        <span className="wcard__num">Weekend {weekend.number}</span>
        <span className="wcard__meta">
          <span className="wcard__dates">{weekend.dates}</span>
          {room && <span className="wcard__room">{room}</span>}
        </span>
      </div>
      <h3 className="wcard__title">{weekend.title}</h3>
      <p className="wcard__theme">{weekend.theme}</p>
      <div style={{ marginBottom: 16 }}>
        <CategoryBadge category={weekend.category} />
      </div>
      <span className="wcard__cta">View schedule</span>

      <SchedulePeek weekend={weekend} />
    </Link>
  );
}

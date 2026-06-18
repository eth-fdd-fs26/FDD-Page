import type { Session } from '../types';
import { SessionTypeChip } from './SessionTypeChip';

interface Props {
  day: string;
  date: string;
  sessions: Session[];
}

export function ScheduleTable({ day, date, sessions }: Props) {
  return (
    <div className="day">
      <div className="day__head">
        <h3>{day}</h3>
        <span className="day__date">{date}</span>
      </div>
      <div className="schedule">
        {sessions.map((s, i) => (
          <div key={i} className={`srow${s.type === 'break' ? ' srow--break' : ''}`}>
            <div className="srow__time">{s.time}</div>
            <div className="srow__body">
              <span className="srow__title">{s.title}</span>
              {s.type !== 'break' && (
                <span className="srow__meta">
                  <SessionTypeChip type={s.type} />
                  {s.who && <span className="srow__who">{s.who}</span>}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

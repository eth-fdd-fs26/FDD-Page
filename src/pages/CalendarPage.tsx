import { Link } from 'react-router-dom';
import {
  allEvents,
  calendarMonths,
  eventsOnDay,
  type CourseEvent,
} from '../data/calendar';
import { getWeekend } from '../data/weekends';
import { SchedulePeek } from '../components/SchedulePeek';
import { downloadICS, googleCalendarUrl } from '../lib/ics';
import {
  MONTH_NAMES,
  WEEKDAYS_SHORT,
  daysInMonth,
  firstWeekdayMonday,
  formatLongDate,
  toISO,
} from '../lib/date';

function EventChip({ event }: { event: CourseEvent }) {
  if (event.type === 'weekend') {
    return (
      <Link to={`/weekend/${event.weekendId}`} className="cal-ev cal-ev--weekend">
        WE{event.weekendNumber}
      </Link>
    );
  }
  return (
    <span className="cal-ev cal-ev--deadline" title={event.title}>
      {event.title}
    </span>
  );
}

function MonthGrid({ year, month0 }: { year: number; month0: number }) {
  const total = daysInMonth(year, month0);
  const lead = firstWeekdayMonday(year, month0);
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div className="month">
      <h3 className="month__title">
        {MONTH_NAMES[month0]} <span>{year}</span>
      </h3>
      <div className="cal-table">
        <div className="cal-grid cal-grid--head">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="cal-weekday">
              {d}
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b${i}`} className="cal-cell cal-cell--blank" />;
            const iso = toISO(year, month0, day);
            const events = eventsOnDay(iso);
            const weekendEvent = events.find((e) => e.type === 'weekend' && e.weekendId);
            const weekend = weekendEvent ? getWeekend(weekendEvent.weekendId!) : undefined;
            return (
              <div key={iso} className={`cal-cell${weekend ? ' cal-cell--weekend' : ''}`}>
                <span className="cal-cell__day">{day}</span>
                <div className="cal-cell__events">
                  {events.map((e) => (
                    <EventChip key={e.uid + iso} event={e} />
                  ))}
                </div>
                {weekend && <SchedulePeek weekend={weekend} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CalendarPage() {
  return (
    <article className="section">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow">ETH Zürich · Summer 2026</p>
          <h2 style={{ fontSize: '1.9rem' }}>Course calendar</h2>
          <p>
            All eight weekends and key deadlines across June–August 2026. Add them to your own
            calendar with the buttons below.
          </p>
        </div>

        {/* Export panel */}
        <div className="export">
          <div className="export__main">
            <button className="btn" onClick={() => downloadICS(allEvents)}>
              Download calendar (.ics)
            </button>
            <p className="export__hint">
              Opens directly in <strong>Apple Calendar</strong> and <strong>Outlook</strong>. For{' '}
              <strong>Google Calendar</strong>, use Settings → Import, or add a single event with the
              “Google” links below.
            </p>
          </div>
          <div className="legend export__legend">
            <span className="legend__item">
              <span className="legend__dot" style={{ background: 'var(--eth-blue)' }} />
              Weekend
            </span>
            <span className="legend__item">
              <span className="legend__dot" style={{ background: 'var(--eth-red)' }} />
              Deadline
            </span>
          </div>
        </div>

        {/* Month grids — June / July / August side by side */}
        <div className="cal-months">
          {calendarMonths.map((m) => (
            <MonthGrid key={`${m.year}-${m.month0}`} year={m.year} month0={m.month0} />
          ))}
        </div>

        {/* Chronological event list */}
        <section className="agenda">
          <h3>All dates</h3>
          <p className="resources__note">
            Each homework / project is assigned at its weekend and due ahead of the next one.
          </p>
          <ul className="agenda__list">
            {allEvents.map((e) => {
              const weekend = e.weekendId ? getWeekend(e.weekendId) : undefined;
              return (
                <li key={e.uid} className={`agenda__item agenda__item--${e.type}`}>
                  <div className="agenda__when">
                    <span className="agenda__date">{formatLongDate(e.start)}</span>
                    {e.end !== e.start && (
                      <span className="agenda__date agenda__date--end">
                        → {formatLongDate(e.end)}
                      </span>
                    )}
                  </div>
                  <div className="agenda__what">
                    {weekend ? (
                      <Link to={`/weekend/${weekend.id}`}>{e.title}</Link>
                    ) : (
                      <span>{e.title}</span>
                    )}
                  </div>
                  <a
                    className="agenda__google"
                    href={googleCalendarUrl(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    + Google
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </article>
  );
}

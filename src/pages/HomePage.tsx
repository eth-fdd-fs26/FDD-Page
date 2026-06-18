import { Link } from 'react-router-dom';
import { weekends } from '../data/weekends';
import { WeekendCard } from '../components/WeekendCard';
import { CalendarStrip } from '../components/CalendarStrip';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <p className="eyebrow">ETH Zürich · Summer 2026</p>
            <h1>From Data to Decisions</h1>
            <div className="hero__rule" />
            <p className="hero__lead">
              An intensive, hands-on programme across eight weekends — from the Python and machine
              learning foundations through to security, reinforcement learning, retrieval-augmented
              generation, agentic and large-scale AI.
            </p>
            <dl className="hero__meta">
              <div>
                <dt>Weekends</dt>
                <dd>8</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd>26 June – 29 August 2026</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Lectures, coding exercises &amp; projects</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>The eight weekends</h2>
            <p>Select a weekend to see its full schedule and resources.</p>
          </div>

          <div className="card-grid">
            {weekends.map((w) => (
              <WeekendCard key={w.id} weekend={w} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Course calendar</h2>
            <p>Chronological overview of all weekends.</p>
          </div>
          <CalendarStrip />
          <div className="section__cta">
            <Link to="/calendar" className="btn">
              Open full calendar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

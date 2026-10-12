import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { weekends } from '../data/weekends';

/**
 * Shape of public/quiz-results.json, written by scripts/fetch-quizzes.mjs.
 * `done` lists the weekend ids of the quizzes the student completed (scores
 * are deliberately not published); `emails` holds the SHA-256 of every email
 * the student used.
 */
interface Student {
  name: string;
  groups: string[];
  done: string[];
  emails: string[];
}

interface QuizResults {
  updated: string;
  /** Weekend ids of the released quizzes, in course order. */
  quizzes: string[];
  /** Group id ("Group 07") → assigned TA's name. */
  groups: Record<string, string>;
  students: Student[];
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** "Lucía  Jodra" → "lucia jodra", so searches ignore accents and spacing. */
const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** "7", "07", "group 7", "Group 07" → "Group 07"; anything else → null. */
function groupId(query: string): string | null {
  const m = /^(?:group\s*)?(\d{1,2})$/i.exec(query.trim());
  return m ? `Group ${m[1].padStart(2, '0')}` : null;
}

export function QuizPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [emailHash, setEmailHash] = useState<string | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);

  useEffect(() => {
    // Relative URL: the site is served from the GitHub Pages repo subpath.
    fetch('quiz-results.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setResults)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q.includes('@')) return setEmailHash(null);
    let current = true;
    sha256Hex(q).then((h) => current && setEmailHash(h));
    return () => {
      current = false;
    };
  }, [query]);

  const group = groupId(query);
  const matches = useMemo(() => {
    if (!results) return [];
    const q = query.trim();
    if (group) return results.students.filter((s) => s.groups.includes(group));
    if (q.includes('@')) return emailHash ? results.students.filter((s) => s.emails.includes(emailHash)) : [];
    if (norm(q).length < 2) return [];
    return results.students.filter((s) => norm(s.name).includes(norm(q)));
  }, [results, query, group, emailHash]);

  const student = selected ?? (matches.length === 1 && !group ? matches[0] : null);
  const quizzes = results?.quizzes ?? [];

  return (
    <article className="section">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow">ETH Zürich · Summer 2026</p>
          <h2 style={{ fontSize: '1.9rem' }}>Quiz progress</h2>
          <p>
            Search by name, email or group number to see which quizzes have been completed and
            which ones are still missing. Results are refreshed from the forms about once an hour.
            If a result looks wrong, contact your TA.
          </p>
        </div>

        {loadError ? (
          <div className="notice">
            <h3 className="notice__title">Quiz results are not available</h3>
            <p>The results file could not be loaded. Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="oh-id">
              <label className="field oh-id__field">
                <span className="field__label">Name, email or group number</span>
                <input
                  className="field__input"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(null);
                  }}
                  placeholder="e.g. Anna Müller, amueller@ethz.ch or 12"
                  disabled={!results}
                />
              </label>
            </div>

            {results && query.trim() && !student && matches.length === 0 && (
              <div className="notice">
                <h3 className="notice__title">No student found</h3>
                <p>
                  {group
                    ? `${group} has no members yet.`
                    : 'Try another spelling, or the email address you entered in the quiz forms.'}
                </p>
              </div>
            )}

            {student ? (
              <StudentDetail
                student={student}
                quizzes={quizzes}
                tas={results?.groups ?? {}}
                onBack={selected ? () => setSelected(null) : undefined}
              />
            ) : (
              matches.length > 0 && (
                <>
                  {group && (
                    <p className="quiz-summary">
                      <strong>{group}</strong>
                      {results?.groups[group] && <> · TA: {results.groups[group]}</>}
                    </p>
                  )}
                  <div className="quiz-scroll">
                    <table className="quiz-table quiz-table--grid">
                      <thead>
                        <tr>
                          <th>Student</th>
                          {!group && <th>Group</th>}
                          {quizzes.map((q, i) => (
                            <th key={q} className="quiz-num">
                              Q{i + 1}
                            </th>
                          ))}
                          <th className="quiz-num">Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((s) => {
                          const done = s.done.length;
                          return (
                            <tr key={s.name + s.groups.join()}>
                              <td>
                                <button type="button" className="quiz-name" onClick={() => setSelected(s)}>
                                  {s.name}
                                </button>
                              </td>
                              {!group && <td>{s.groups.join(', ') || '–'}</td>}
                              {quizzes.map((q, i) => (
                                <td key={q} className="quiz-num">
                                  <Dot done={s.done.includes(q)} label={`Quiz ${i + 1}`} />
                                </td>
                              ))}
                              <td className="quiz-num">
                                {done} / {quizzes.length}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            )}

            {results && (
              <p className="quiz-updated">
                Last updated{' '}
                {new Date(results.updated).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function StudentDetail({
  student,
  quizzes,
  tas,
  onBack,
}: {
  student: Student;
  quizzes: QuizResults['quizzes'];
  tas: Record<string, string>;
  onBack?: () => void;
}) {
  const rows = quizzes.map((q) => {
    const weekend = weekends.find((w) => w.id === q);
    const quizUrl = weekend?.resources.find((r) => r.group === 'Quiz')?.url;
    return { id: q, weekend, quizUrl, done: student.done.includes(q) };
  });

  return (
    <>
      {onBack && (
        <button type="button" className="btn btn--ghost quiz-back" onClick={onBack}>
          ‹ Back to results
        </button>
      )}
      <p className="quiz-summary">
        <strong>{student.name}</strong>
        {student.groups.map((g) => (
          <span key={g}>
            {' · '}
            {g}
            {tas[g] && ` (TA: ${tas[g]})`}
          </span>
        ))}
        <br />
        <strong>
          {student.done.length} of {rows.length}
        </strong>{' '}
        quizzes completed
      </p>
      <table className="quiz-table">
        <thead>
          <tr>
            <th>Weekend</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link to={`/weekend/${r.id}`}>
                  Weekend {r.weekend?.number} · {r.weekend?.title}
                </Link>
              </td>
              <td>
                {r.done ? (
                  <>
                    <Dot done /> Completed
                  </>
                ) : (
                  <span className="quiz-missing">
                    <Dot done={false} /> Missing
                    {r.quizUrl && (
                      <>
                        {' · '}
                        <a href={r.quizUrl} target="_blank" rel="noreferrer">
                          Take the quiz
                        </a>
                      </>
                    )}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Dot({ done, label }: { done: boolean; label?: string }) {
  const text = `${label ? label + ': ' : ''}${done ? 'completed' : 'missing'}`;
  return <span className={`quiz-dot ${done ? 'quiz-dot--done' : 'quiz-dot--missing'}`} title={text} aria-label={text} />;
}

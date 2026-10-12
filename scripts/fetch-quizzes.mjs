// Builds public/quiz-results.json from the quiz responses spreadsheet and the
// project group sheet.
//
// Each quiz is one Google Form whose responses land in one tab of the quiz
// spreadsheet. Both spreadsheets must stay readable by "anyone with the link"
// so their tabs can be exported as CSV without credentials.
//
// The output lists every student with their name, group(s) and which quizzes
// they completed, so TAs and students can search by name or group number.
// Scores, answers and emails are never written: the file is public. Each
// student carries only the SHA-256 of the emails they used, so the page can
// still find them by email.
//
// Run with `npm run quizzes`. The deploy workflow runs it hourly before the build.

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const SHEET_ID = '1kQdEjhPlWoRsRApUiFAhhfgRXacaU9lJpZCdXPA5FLc';
const GROUPS_SHEET_ID = '16etnwbSy_q3i2knIHAEc2E-_rgdINJuxnegHYDZa4BM';
const GROUPS_GID = '1342120875';

// One entry per released quiz, in course order. `gid` is the tab id in the
// sheet URL (…#gid=…). Add a line here when a new quiz goes out.
const QUIZZES = [
  { weekendId: 'we1', gid: '3643336' },
  { weekendId: 'we2', gid: '663042952' },
  { weekendId: 'we3', gid: '1100013593' },
  { weekendId: 'we4', gid: '672821594' },
  { weekendId: 'we5', gid: '60759536' },
  { weekendId: 'we6', gid: '2024869843' },
  { weekendId: 'we7', gid: '2058119965' },
];

// Names typed so differently that no email links them to the rest of the
// student's submissions. Keys and values are normalised (lower case, no
// accents). Run the script locally to list the names that still need one.
const NAME_ALIASES = {
  'xavier deulofeu': 'xavier deulofeu jimeno',
  vangendt: 'thomas vangendt',
  raphael6: 'raphael fassler',
  'akash c': 'akash chawla',
};

const OUT = new URL('../public/quiz-results.json', import.meta.url);

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, newlines inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

async function fetchCsv(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  const type = res.headers.get('content-type') ?? '';
  if (!res.ok || !type.startsWith('text/csv')) {
    throw new Error(`gid ${gid}: HTTP ${res.status} (${type}). Is the sheet still shared by link?`);
  }
  return parseCsv(await res.text());
}

async function fetchTab(gid) {
  const [header, ...rows] = await fetchCsv(SHEET_ID, gid);
  const col = (name) => header.indexOf(name);
  return { email: col('Email Address'), score: col('Score'), name: col('Name'), rows };
}

/** "Lucía  Jodra" → "lucia jodra", so accent and spacing variants still match. */
const normName = (s) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

const hashEmail = (email) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

/** "8 / 10" → [8, 10] */
function parseScore(s) {
  const m = /^\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/.exec(s);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * Group sheet rows look like: Group 01 | name | email | "TA name\nTA email" | ...
 * The TA is written only on a group's first row.
 */
async function fetchGroups() {
  const rows = await fetchCsv(GROUPS_SHEET_ID, GROUPS_GID);
  const tas = {};
  const members = [];
  for (const r of rows) {
    if (!/^Group \d+$/.test(r[0] ?? '')) continue;
    const ta = (r[3] ?? '').split('\n')[0].trim();
    if (ta && (r[3] ?? '').includes('@')) tas[r[0]] = ta;
    if ((r[1] ?? '').trim() || (r[2] ?? '').trim()) {
      members.push({ group: r[0], name: r[1].trim(), email: (r[2] ?? '').trim().toLowerCase() });
    }
  }
  return { tas, members };
}

const [tabs, groupSheet] = await Promise.all([
  Promise.all(QUIZZES.map((q) => fetchTab(q.gid))),
  fetchGroups(),
]);

// Test submissions made while setting up the forms.
const isTest = (name) => /^tes(t)?\s*\d*$/.test(normName(name));

// A student is not one email: many submitted different quizzes from
// different addresses (ethz.ch, student.ethz.ch, gmail, typos), and quiz 1
// collected no email at all. Submissions and group sheet rows are therefore
// grouped with union-find: two records belong to the same student when they
// share an email, an ETH login, or the same normalised name.
const parent = new Map();
const find = (x) => {
  if (!parent.has(x)) parent.set(x, x);
  while (parent.get(x) !== x) x = parent.get(x);
  return x;
};
const union = (a, b) => parent.set(find(a), find(b));

function nodesFor(email, rawName) {
  const nodes = [];
  if (email) {
    const [local, domain = ''] = email.split('@');
    // Any *hz.ch domain is an ETH address, typos like "rthz" and "erhz"
    // included, so the login before the @ identifies the student across them.
    nodes.push(domain.endsWith('hz.ch') ? `l:${local}` : `e:${email}`);
  }
  const name = normName(rawName ?? '');
  if (name) nodes.push(`n:${NAME_ALIASES[name] ?? name}`);
  return nodes;
}

const records = [];
QUIZZES.forEach((q, i) => {
  const t = tabs[i];
  for (const r of t.rows) {
    const score = parseScore(r[t.score] ?? '');
    const name = t.name >= 0 ? (r[t.name] ?? '').trim() : '';
    const email = t.email >= 0 ? (r[t.email] ?? '').trim().toLowerCase() : '';
    if (!score || isTest(name)) continue;
    records.push({ nodes: nodesFor(email, name), name, email, quiz: q.weekendId });
  }
});
for (const m of groupSheet.members) {
  records.push({ nodes: nodesFor(m.email, m.name), name: m.name, email: m.email, group: m.group });
}
for (const rec of records) {
  if (!rec.nodes.length) continue;
  find(rec.nodes[0]);
  for (const n of rec.nodes.slice(1)) union(rec.nodes[0], n);
}

const byRoot = new Map();
const quizzes = QUIZZES.map((q) => q.weekendId);
for (const rec of records) {
  if (!rec.nodes.length) continue;
  const root = find(rec.nodes[0]);
  if (!byRoot.has(root)) byRoot.set(root, { names: [], sheetName: '', groups: new Set(), emails: new Set(), done: new Set() });
  const s = byRoot.get(root);
  if (rec.email) s.emails.add(rec.email);
  if (rec.group) {
    s.groups.add(rec.group);
    s.sheetName ||= rec.name;
  } else {
    if (rec.name) s.names.push(rec.name);
    s.done.add(rec.quiz);
  }
}

/** The group sheet's spelling wins; otherwise the name typed most often. */
function displayName(s) {
  if (s.sheetName) return s.sheetName;
  const counts = new Map();
  for (const n of s.names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0] ?? '';
}

const students = [...byRoot.values()]
  .map((s) => ({
    name: displayName(s),
    groups: [...s.groups].sort(),
    done: quizzes.filter((q) => s.done.has(q)),
    emails: [...s.emails].map(hashEmail),
  }))
  .filter((s) => s.name)
  .sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(new URL('.', OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ updated: new Date().toISOString(), quizzes, groups: groupSheet.tas, students }),
);
const grouped = students.filter((s) => s.groups.length).length;
console.log(`Wrote ${students.length} students (${grouped} in a group) to public/quiz-results.json`);
// Names stay out of CI logs, which may be public.
if (!process.env.CI) {
  for (const s of students.filter((x) => x.groups.length > 1)) console.log(`  in several groups: ${s.name} ${s.groups}`);
  for (const s of students.filter((x) => !x.groups.length)) console.log(`  no group: ${s.name}`);
}

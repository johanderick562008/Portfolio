import { useMemo, useState } from "react";
import { CaseHeader, CaseSection, LessonPlan, NextCase } from "../components/CaseParts";
import { ExtLink, Shot, Stack, StatusTag } from "../components/Common";
import { Hand, Mark } from "../components/Ink";
import { ACTORS, AUTH, DECISIONS, HEALTH_URL, LESSONS, LIVE_URL, SCHEMA, SHOTS, TRADEOFFS, type Column } from "../data/freeboard";
import { featured } from "../data/projects";

const PLAN = [
  { id: "problem", label: "The problem" },
  { id: "product", label: "What it does" },
  { id: "decisions", label: "Decisions" },
  { id: "schema", label: "The schema" },
  { id: "auth", label: "The auth flow" },
  { id: "try", label: "Try the query" },
  { id: "tradeoffs", label: "Trade-offs" },
  { id: "learned", label: "What I learned" },
];

/* ------------------------------------------------------------------ schema */

function refOf(c: Column): string | null {
  return c.key === "FK" ? "users.id" : null;
}

function Schema() {
  // Hover or focus a key to light up both ends of the relationship.
  const [hot, setHot] = useState<string | null>(null);
  return (
    <div className="schema" onMouseLeave={() => setHot(null)}>
      {SCHEMA.map((t) => (
        <figure key={t.name} className={`er er-${t.name}`} aria-labelledby={`er-${t.name}`}>
          <figcaption id={`er-${t.name}`} className="er-name mono">
            {t.name}
          </figcaption>
          <table>
            <caption className="sr-only">Columns of the {t.name} table</caption>
            <tbody>
              {t.columns.map((c) => {
                const self = `${t.name}.${c.name}`;
                const ref = refOf(c);
                // users.id lights every foreign key; a foreign key lights itself and users.id.
                const lit =
                  !!hot && ((hot === "users.id" && (self === "users.id" || !!ref)) || hot === `fk:${self}` || (hot.startsWith("fk:") && self === "users.id"));
                const focusKey = ref ? `fk:${self}` : self === "users.id" ? "users.id" : null;
                return (
                  <tr key={c.name} className={lit ? "is-lit" : ""}>
                    <th scope="row">
                      {focusKey ? (
                        <button
                          type="button"
                          className="er-key"
                          onMouseEnter={() => setHot(focusKey)}
                          onFocus={() => setHot(focusKey)}
                          onBlur={() => setHot(null)}
                          aria-describedby={`erk-${t.name}-${c.name}`}
                        >
                          {c.name}
                        </button>
                      ) : (
                        <span>{c.name}</span>
                      )}
                      {c.key && <span className={`er-badge er-${c.key.toLowerCase()}`}>{c.key}</span>}
                    </th>
                    <td className="mono er-type">{c.type}</td>
                    <td className="er-note" id={`erk-${t.name}-${c.name}`}>
                      {c.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {t.constraints.length > 0 && (
            <ul className="er-cons mono">
              {t.constraints.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
          {t.note && <p className="er-foot">{t.note}</p>}
        </figure>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- auth */

function AuthFlow() {
  const [step, setStep] = useState(0);
  const s = AUTH[step];
  const col = (a: string) => ACTORS.findIndex((x) => x.id === a);
  return (
    <div className="seq">
      <div className="seq-diagram">
        <ol className="seq-actors" aria-hidden="true">
          {ACTORS.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong>
              <span className="mono">{a.sub}</span>
            </li>
          ))}
        </ol>
        <ol className="seq-steps">
          {AUTH.map((st, i) => {
            const a = col(st.from);
            const b = col(st.to);
            const lo = Math.min(a, b);
            const span = Math.abs(a - b) + 1;
            return (
              <li key={i} className={`seq-step ${i === step ? "is-on" : ""} ${i < step ? "is-past" : ""}`}>
                <button
                  type="button"
                  className="seq-btn"
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => setStep(i)}
                  style={{ ["--c" as string]: `${lo + 1} / span ${span}`, ["--span" as string]: span }}
                >
                  <span className="seq-no mono">{i + 1}</span>
                  <span className={`seq-arrow ${b < a ? "is-back" : ""}`} aria-hidden="true" />
                  <span className="seq-label">
                    <span className="seq-who mono">
                      {ACTORS[a].name} → {ACTORS[b].name}
                    </span>
                    <span className="seq-what">{st.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="seq-detail" aria-live="polite">
        <p className="seq-count mono">
          Step {step + 1} of {AUTH.length} · {ACTORS[col(s.from)].name} → {ACTORS[col(s.to)].name}
        </p>
        <h3 className="seq-h">{s.label}</h3>
        <p>{s.detail}</p>
        {s.code && (
          <pre className="code">
            <code>{s.code}</code>
          </pre>
        )}
        <div className="seq-nav">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}>
            <span aria-hidden="true">←</span> Previous
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setStep((x) => Math.min(AUTH.length - 1, x + 1))} disabled={step === AUTH.length - 1}>
            Next step <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- query preview */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
/** FreeBoard's default eight periods (backend/app/routers/settings.py). */
const BELL = ["08:45", "09:45", "11:00", "12:00", "13:00", "14:00", "15:15", "16:15"];
const SLOTS = BELL.length;

function seed(s: number): boolean[][] {
  let x = s;
  const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return DAYS.map(() => Array.from({ length: SLOTS }, (_, i) => i === 4 || rnd() < 0.3));
}
/** Sample timetables (free = true). Not real people. */
const PEOPLE = [
  { name: "You", free: seed(3) },
  { name: "Aarav", free: seed(7) },
  { name: "Tony", free: seed(11) },
  { name: "Kabir", free: seed(19) },
];

function QueryPreview() {
  const [view, setView] = useState<"live" | "together">("live");
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(2);
  const together = useMemo(() => DAYS.map((_, d) => Array.from({ length: SLOTS }, (_, s) => PEOPLE.filter((p) => p.free[d][s]).length)), []);

  return (
    <div className="qp">
      <div className="seg qp-tabs" role="group" aria-label="Endpoint">
        <button type="button" aria-pressed={view === "live"} onClick={() => setView("live")}>
          /schedule/live
        </button>
        <button type="button" aria-pressed={view === "together"} onClick={() => setView("together")}>
          /schedule/together
        </button>
      </div>

      {view === "live" ? (
        <div className="qp-body">
          <div className="qp-pick">
            <div className="seg" role="group" aria-label="Day">
              {DAYS.map((d, i) => (
                <button key={d} type="button" aria-pressed={day === i} onClick={() => setDay(i)}>
                  {d}
                </button>
              ))}
            </div>
            <div className="seg" role="group" aria-label="Period">
              {BELL.map((t, i) => (
                <button key={t} type="button" aria-pressed={slot === i} onClick={() => setSlot(i)} aria-label={`Period ${i + 1}, ${t}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <pre className="code qp-req">
            <code>
              GET /schedule/live?day={FULL_DAYS[day]}&amp;slot_index={slot}
            </code>
          </pre>
          <ul className="qp-people" aria-live="polite" aria-label="Response">
            {PEOPLE.map((p) => {
              const free = p.free[day][slot];
              return (
                <li key={p.name} className={free ? "is-free" : ""}>
                  <span className="qp-av" aria-hidden="true">
                    {p.name[0]}
                  </span>
                  <span>{p.name}</span>
                  <span className="mono qp-state">{free ? "free" : "in class"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="qp-body">
          <pre className="code qp-req">
            <code>GET /schedule/together?user_ids=1,2,3,4</code>
          </pre>
          <table className="qp-grid">
            <caption className="mono">Darker = more of the four free · outlined = everyone free</caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Day</span>
                </th>
                {BELL.map((t) => (
                  <th key={t} scope="col" className="mono">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d, di) => (
                <tr key={d}>
                  <th scope="row" className="mono">
                    {d}
                  </th>
                  {together[di].map((n, si) => (
                    <td key={si} className={n === PEOPLE.length ? "is-all" : ""} style={{ ["--t" as string]: n / PEOPLE.length }}>
                      <span className="sr-only">{n === PEOPLE.length ? "everyone free" : `${n} of ${PEOPLE.length} free`}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="qp-foot mono">Illustration with sample data · same query shapes as the real API</p>
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function FreeBoardCase() {
  const p = featured.freeboard;
  return (
    <article className="case case-fb">
      <CaseHeader
        crumb="FreeBoard"
        title={
          <>
            FreeBoard <em>case study</em>
          </>
        }
        lede={
          <>
            A web app that answers the question students ask between periods: <Mark>who's free right now?</Mark> Built end to end by me,
            and live.
          </>
        }
        meta={[
          { k: "Status", v: <StatusTag status={p.status} /> },
          { k: "Since", v: p.published },
          { k: "I built", v: "Schema, FastAPI backend, frontend, both deploys" },
          {
            k: "Links",
            v: (
              <span className="case-links">
                <ExtLink href={LIVE_URL}>Open the app</ExtLink>
                <ExtLink href={HEALTH_URL}>API health</ExtLink>
                {p.repo && <ExtLink href={p.repo}>Source</ExtLink>}
              </span>
            ),
          },
        ]}
      >
        <Stack items={p.stack} />
      </CaseHeader>

      <figure className="case-hero-shot wrap">
        <div className="frame" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="mono">freeboard-phi.vercel.app/app.html</span>
        </div>
        <Shot s={SHOTS.live} sizes="(min-width: 1360px) 1280px, 94vw" eager />
        <figcaption>
          {SHOTS.live.caption} <span className="muted">Screenshots are of the deployed app; the people in them are sample data.</span>
        </figcaption>
      </figure>

      <div className="case-body wrap">
        <LessonPlan items={PLAN} />
        <div className="case-main">
          <CaseSection id="problem" n={1} title="The problem">
            <p className="cs-lead">Between periods, everyone asks the same thing: who's free? The answer is spread across everyone's timetables, on everyone's phones.</p>
            <p>
              I wanted it to be a lookup instead of a group chat. Save your timetable once, connect with the people you actually meet up
              with, and the app answers for the current period. That meant real accounts, a real database and a deployment that stays up,
              so it became my first full-stack project.
            </p>
          </CaseSection>

          <CaseSection id="product" n={2} title="What it does" wide>
            <div className="gallery">
              {[SHOTS.browse, SHOTS.together].map((s) => (
                <figure key={s.src} className="g-shot">
                  <Shot s={s} sizes="(min-width: 1100px) 520px, 94vw" />
                  <figcaption>{s.caption}</figcaption>
                </figure>
              ))}
              <figure className="g-shot g-wide">
                <Shot s={SHOTS.builder} sizes="(min-width: 1100px) 1060px, 94vw" />
                <figcaption>{SHOTS.builder.caption}</figcaption>
              </figure>
            </div>
          </CaseSection>

          <CaseSection id="decisions" n={3} title="Decisions">
            <ol className="decisions">
              {DECISIONS.map((d, i) => (
                <li key={d.id} className="decision" data-reveal>
                  <p className="decision-n hand">{i + 1}.</p>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                  {d.code && (
                    <pre className="code">
                      <code>{d.code}</code>
                    </pre>
                  )}
                  <p className="mono src">source · {d.source}</p>
                </li>
              ))}
            </ol>
          </CaseSection>

          <CaseSection id="schema" n={4} title="The schema" wide>
            <p className="cs-intro">
              Three tables from <code className="mono">schema.sql</code>, plus the period settings the backend writes. Hover or focus a key
              to see what it points to.
            </p>
            <Schema />
            <Hand className="schema-note" as="p">
              the unique keys do the real work: the database itself refuses a duplicate period or a duplicate connection
            </Hand>
          </CaseSection>

          <CaseSection id="auth" n={5} title="The auth flow" wide>
            <p className="cs-intro">Google sign-in with Authlib, then a JWT in an httpOnly cookie. Step through it:</p>
            <div className="auth-wrap">
              <AuthFlow />
              <figure className="auth-shot">
                <Shot s={SHOTS.signin} sizes="(min-width: 1100px) 340px, 80vw" />
                <figcaption>{SHOTS.signin.caption}</figcaption>
              </figure>
            </div>
          </CaseSection>

          <CaseSection id="try" n={6} title="Try the query">
            <p className="cs-intro">
              Live and Together boil down to two endpoints. This is a sample-data illustration of what they return, using FreeBoard's default
              bell times.
            </p>
            <QueryPreview />
          </CaseSection>

          <CaseSection id="tradeoffs" n={7} title="Trade-offs">
            <div className="table-scroll">
              <table className="tradeoffs">
                <thead>
                  <tr>
                    <th scope="col">I chose</th>
                    <th scope="col">Over</th>
                    <th scope="col">Because</th>
                    <th scope="col">What it cost</th>
                  </tr>
                </thead>
                <tbody>
                  {TRADEOFFS.map((t) => (
                    <tr key={t.chose}>
                      <th scope="row" data-label="I chose">
                        {t.chose}
                      </th>
                      <td data-label="Over">{t.over}</td>
                      <td data-label="Because">{t.because}</td>
                      <td data-label="What it cost">{t.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CaseSection>

          <CaseSection id="learned" n={8} title="What I learned">
            <ol className="lessons">
              {LESSONS.map((l) => (
                <li key={l} data-reveal>
                  {l}
                </li>
              ))}
            </ol>
          </CaseSection>
        </div>
      </div>
      <NextCase to="/work/risk-predictor" label="Next case study" title="Student Academic Risk Predictor" />
    </article>
  );
}

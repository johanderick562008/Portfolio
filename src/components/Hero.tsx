import { site } from "../config/site";
import { TIMETABLE, periodOf, whereAreYou, type Where } from "../data/timetable";
import { useNow } from "../hooks/hooks";
import { Link } from "../router";
import { Arrow, Hand, Mark, Wonky } from "./Ink";

function whereText(w: Where | null): string {
  if (!w) return "";
  switch (w.kind) {
    case "in": {
      const p = periodOf(w.id);
      if (p.kind === "break") return `it's ${w.time} where you are: recess! the games are this way`;
      if (p.kind === "free") return `it's ${w.time} where you are: free period. perfect timing`;
      return `it's ${w.time} where you are, so that's ${p.period}: ${p.label}`;
    }
    case "before":
      return `it's ${w.time} where you are. first bell's at 08:45, so start anywhere`;
    case "late":
      return `it's ${w.time} where you are, past this page's last period`;
    case "after":
      return `it's ${w.time} where you are. school's out: read in any order`;
    case "weekend":
      return `it's ${w.day} where you are. no bell today`;
  }
}

/**
 * The signature moment: the day's timetable writes itself in, row by row, and
 * marks the period it is right now on the visitor's own clock. It doubles as
 * the table of contents, and docks into the nav once it scrolls away.
 */
function TodayCard() {
  const now = useNow();
  const where = now ? whereAreYou(now) : null;
  const current = where?.kind === "in" ? where.id : null;

  return (
    <aside id="today" className="today" aria-labelledby="today-title">
      <div className="today-head">
        <h2 id="today-title" className="today-title">
          Today's timetable
        </h2>
        <span className="today-sub mono">this page, by period</span>
      </div>
      <ol className="today-rows">
        {TIMETABLE.map((p, i) => (
          <li key={p.id} className={`today-row today-${p.kind} ${current === p.id ? "is-now" : ""}`} style={{ ["--i" as string]: i }}>
            <Link to={`/#${p.id}`} className="today-link">
              <span className="today-p">
                <span className="today-p-text">{p.period}</span>
                <span className="today-bunk" aria-hidden="true">
                  Free
                </span>
              </span>
              <span className="today-time mono">{p.start}</span>
              <span className="today-subj">{p.label}</span>
              <span className="today-blurb">{p.blurb}</span>
              {current === p.id && (
                <span className="today-now hand">
                  <span className="sr-only">, </span>now
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
      <p className="today-foot mono">Bell times are FreeBoard's default periods.</p>
      <p className="hand today-where">
        {where ? (
          <>
            <span>{whereText(where)}</span>
            <Arrow dir="right" />
          </>
        ) : (
          " "
        )}
      </p>
    </aside>
  );
}

export function Hero() {
  return (
    <section className="hero wrap" id="top" aria-labelledby="hero-title">
      <Hand className="hero-hi">hi, I'm</Hand>
      <h1 id="hero-title" className="hero-name" tabIndex={-1}>
        <Wonky text={site.name} />
        <span className="hero-dot" aria-hidden="true" />
      </h1>

      <div className="hero-body">
        <div className="hero-say">
          <p className="hero-role">
            Software developer <em>in the making.</em>
          </p>
          <p className="hero-intro">
            Building useful software, exploring ideas, and turning problems into <Mark>working products.</Mark>
          </p>
          <p className="hero-facts">
            <span>First-year B.Tech</span>
            <span>Python, FastAPI &amp; MySQL</span>
            <span>I learn by building</span>
          </p>
          <div className="hero-ctas">
            <Link to="/#work" className="btn btn-primary">
              See what I've built
            </Link>
            <Link to="/#contact" className="pen link-quiet">
              or say hello <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <TodayCard />
      </div>
    </section>
  );
}

import { site } from "../config/site";
import { journey, skills } from "../data/content";
import { archive, featured, games, mathProjects } from "../data/projects";

/**
 * Only visible when printing (Ctrl/⌘+P, or "Print as a one-page résumé" in the
 * palette). Everything on screen is hidden and this one-page sheet prints instead.
 */
export function PrintSheet() {
  const used = skills.flatMap((g) => g.items.filter((s) => s.depth === "used").map((s) => s.name));
  const learning = skills.flatMap((g) => g.items.filter((s) => s.depth === "learning").map((s) => s.name));
  const small = [...mathProjects, ...games.filter((g) => g.id === "ttt-web"), ...archive.filter((p) => p.id === "miniolx")];
  const strip = (u: string) => u.replace(/^https:\/\/(www\.)?/, "");

  return (
    <div className="print-sheet" aria-hidden="true">
      <header className="ps-head">
        <div>
          <h1>{site.name}</h1>
          <p>First-year B.Tech student · software developer in the making</p>
        </div>
        <ul className="ps-links">
          <li>{strip(site.links.github)}</li>
          {site.links.linkedin && <li>{strip(site.links.linkedin)}</li>}
          {site.links.email && <li>{site.links.email}</li>}
        </ul>
      </header>
      <p className="ps-tag">{site.tagline} I learn by building: Python, FastAPI and MySQL, full-stack apps, and now machine learning.</p>

      <h2>Projects</h2>
      {[featured.freeboard, featured.risk].map((p) => (
        <section key={p.id} className="ps-proj">
          <h3>
            {p.title} <span>· {p.status} · {p.published}</span>
          </h3>
          <p>{p.summary}</p>
          <p className="ps-stack">{p.stack.join(" · ")}</p>
          <p className="ps-url">{p.live[0] ? strip(p.live[0].href) : p.repo ? strip(p.repo) : ""}</p>
        </section>
      ))}
      <ul className="ps-small">
        {small.map((p) => (
          <li key={p.id}>
            <b>{p.title}</b> ({p.published}): {p.summary}
          </li>
        ))}
        <li>
          <b>Python games</b> (Jun 2026): Tic Tac Toe, Hand Cricket, Rock Paper Scissors and FLAMES, all on GitHub.
        </li>
      </ul>

      <div className="ps-cols">
        <section>
          <h2>Skills used in projects</h2>
          <p>{used.join(", ")}</p>
          <h2>Learning</h2>
          <p>{learning.join(", ")}</p>
        </section>
        <section>
          <h2>Timeline</h2>
          <ul className="ps-timeline">
            {journey.map((m) => (
              <li key={m.date}>
                <b>{m.date}</b> {m.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="ps-foot">Printed from the portfolio of {site.name}. Every project listed is public on GitHub.</p>
    </div>
  );
}

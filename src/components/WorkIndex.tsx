import { useId, useState } from "react";
import { EVERYTHING, allCategories, type Category, type Project } from "../data/projects";
import { Link } from "../router";
import { ExtLink, Stack, StatusTag } from "./Common";

function IndexRow({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className={`ix-item ${open ? "is-open" : ""}`} style={{ ["--i" as string]: i }}>
      <button type="button" className="ix-row" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="ix-n mono">{p.index}</span>
        <span className="ix-name">
          <strong>{p.title}</strong>
          <span>{p.kind}</span>
        </span>
        <span className="ix-cat mono">{p.categories.join(" · ")}</span>
        <span className="ix-status">
          <StatusTag status={p.status} />
        </span>
        <span className="ix-date mono">{p.published}</span>
        <span className="ix-toggle" aria-hidden="true" />
      </button>
      <div id={id} className="ix-detail" hidden={!open}>
        <div className="ix-card">
          <p>{p.summary}</p>
          <Stack items={p.stack} />
          <div className="p-links">
            {p.caseStudy && (
              <Link to={p.caseStudy} className="pen">
                Case study <span aria-hidden="true">→</span>
              </Link>
            )}
            {p.playable && (
              <Link to="/#recess" className="pen">
                Play it in Recess <span aria-hidden="true">↓</span>
              </Link>
            )}
            {p.live.map((l) => (
              <ExtLink key={l.href} href={l.href} className="p-link-live">
                {l.label}
              </ExtLink>
            ))}
            {p.repo && <ExtLink href={p.repo}>Source</ExtLink>}
          </div>
        </div>
      </div>
    </li>
  );
}

export function WorkIndex() {
  const [cat, setCat] = useState<"All" | Category>("All");
  const list = cat === "All" ? EVERYTHING : EVERYTHING.filter((p) => p.categories.includes(cat));
  const count = (c: "All" | Category) => (c === "All" ? EVERYTHING.length : EVERYTHING.filter((p) => p.categories.includes(c)).length);

  return (
    <section className="ix wrap" aria-labelledby="index-title" data-reveal>
      <header className="ix-head">
        <div>
          <h3 id="index-title" className="sub-title">
            Index of all work
          </h3>
          <p className="ix-sub">Every public repo, with its status stated plainly. Open a row for details.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter projects by area">
          {allCategories.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c} <span className="mono">{count(c)}</span>
            </button>
          ))}
        </div>
      </header>
      <p className="sr-only" aria-live="polite">
        Showing {list.length} projects{cat === "All" ? "" : ` in ${cat}`}.
      </p>
      <div className="ix-th mono" aria-hidden="true">
        <span>No.</span>
        <span>Project</span>
        <span>Area</span>
        <span>Status</span>
        <span>Since</span>
      </div>
      <ul className="ix-list">
        {list.map((p, i) => (
          <IndexRow key={`${cat}-${p.id}`} p={p} i={i} />
        ))}
      </ul>
    </section>
  );
}


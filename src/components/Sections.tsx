import { useState } from "react";
import { journey, notes, now, skills, type Depth } from "../data/content";
import { SectionHead } from "./Common";
import { Hand } from "./Ink";

function NowCard() {
  return (
    <aside className="card-index now-card" aria-labelledby="now-title" data-reveal>
      <p className="ci-head">
        <span id="now-title">Now</span>
        <span className="ci-date mono">updated {now.updated}</span>
      </p>
      <ul>
        {now.items.map(([k, v]) => (
          <li key={k}>
            <span className="ci-k">{k}</span> {v}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function About() {
  return (
    <section id="about" className="section about-sec wrap" aria-labelledby="about-title">
      <SectionHead id="about" layout="side" title="A bit about me" aside="(the human bit)" />
      <div className="about" data-reveal>
        <p className="about-lead">I'm a first-year B.Tech student, and I learn by building things and finishing them.</p>
        <div className="about-body">
          <p>
            I started with small Python programs: games, a banking program, a matrix calculator, a number-to-words converter. Each one
            taught me something specific, like loops, validation or edge cases. Then I wanted to build something other people would use,
            which became FreeBoard: a real backend, a relational database, Google sign-in, and a deployment that has to stay up.
          </p>
          <p>
            I care about code that's easy to understand when I come back to it, data models that make bugs hard to write, and being
            honest about what a project does. Lately I've been exploring machine learning the same way, through a complete project where
            I measured whether the model actually helped.
          </p>
        </div>
        <dl className="profile">
          <div>
            <dt>Interested in</dt>
            <dd>Backend systems, database design, and small tools that solve one real problem well.</dd>
          </div>
          <div>
            <dt>Looking for</dt>
            <dd>Internships, open-source work, and developers who've been doing this longer than I have.</dd>
          </div>
        </dl>
        <NowCard />
      </div>
    </section>
  );
}

export function Skills() {
  const [show, setShow] = useState<"all" | Depth>("all");
  return (
    <section id="skills" className="section wrap" aria-labelledby="skills-title">
      <SectionHead
        id="skills"
        layout="split"
        aside="(no fake percentages, promise)"
        title="What I work with"
        kicker="Each skill is either used in a project I finished (it says which) or something I'm still learning."
      />
      <div className="skills-tools" data-reveal>
        <div className="filters" role="group" aria-label="Show skills">
          {(
            [
              ["all", "Everything"],
              ["used", "Used in projects"],
              ["learning", "Still learning"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" className="chip" aria-pressed={show === k} onClick={() => setShow(k)}>
              {l}
            </button>
          ))}
        </div>
        <p className="legend mono">
          <span>
            <i className="dep dep-used" aria-hidden="true" /> used
          </span>
          <span>
            <i className="dep dep-learning" aria-hidden="true" /> learning
          </span>
        </p>
      </div>
      <div className="skills" data-reveal>
        {skills.map((g) => (
          <section key={g.code} className="skill-group" aria-labelledby={`sk-${g.code}`}>
            <h3 id={`sk-${g.code}`}>
              <span className="skill-code">{g.code}</span> {g.title}
            </h3>
            <ul>
              {g.items.map((s) => (
                <li key={s.name} className={show !== "all" && show !== s.depth ? "is-dim" : ""}>
                  <i className={`dep dep-${s.depth}`} aria-hidden="true" />
                  <span className="skill-name">
                    {s.name}
                    <span className="sr-only">, {s.depth === "used" ? "used" : "learning"}</span>
                  </span>
                  <span className="skill-where mono">{s.depth === "used" ? s.where : "learning"}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

export function Notes() {
  return (
    <section id="notes" className="section notes-sec" aria-labelledby="notes-title">
      <div className="wrap">
        <SectionHead
          id="notes"
          layout="stack"
          aside="(how I think, with receipts)"
          title="Engineering notes"
          kicker="Short notes on decisions from my own projects, pinned up like index cards. Each one cites the file it comes from."
        />
        <div className="notes">
          {notes.map((n, i) => (
            <article key={n.id} className={`note note-${i}`} data-reveal>
              <p className="note-meta">
                <span className="note-no hand">N.{String(i + 1).padStart(2, "0")}</span>
                <span className="mono">{n.project}</span>
              </p>
              <h3 className="note-title">{n.title}</h3>
              <p>{n.body}</p>
              {n.code && (
                <pre className="code">
                  <code>{n.code}</code>
                </pre>
              )}
              <p className="mono note-src">source · {n.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Journey() {
  return (
    <section id="journey" className="section wrap" aria-labelledby="journey-title">
      <SectionHead
        id="journey"
        layout="split"
        aside="(so far)"
        title="How I got here"
        kicker="No job titles yet. Dates are when each piece of work first appeared on GitHub."
      />
      <ol className="journey" data-reveal>
        {journey.map((m, i) => (
          <li key={m.date} className={m.date === "Now" ? "is-now" : ""} style={{ ["--i" as string]: i }}>
            <span className="j-date mono">{m.date}</span>
            <span className="j-node" aria-hidden="true" />
            <h3>{m.title}</h3>
            <p>{m.body}</p>
          </li>
        ))}
      </ol>
      <Hand className="journey-note" as="p">
        next entry: whatever I'm building now
      </Hand>
    </section>
  );
}

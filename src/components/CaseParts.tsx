import type { ReactNode } from "react";
import { Link } from "../router";

/** Shared scaffolding for case-study pages: header, lesson-plan contents, numbered sections. */

export function CaseHeader({
  crumb,
  title,
  lede,
  meta,
  children,
}: {
  crumb: string;
  title: ReactNode;
  lede: ReactNode;
  meta: { k: string; v: ReactNode }[];
  children?: ReactNode;
}) {
  return (
    <header className="case-head wrap">
      <nav aria-label="Breadcrumb" className="crumbs mono">
        <ol>
          <li>
            <Link to="/" className="pen">
              Home
            </Link>
          </li>
          <li>
            <Link to="/#work" className="pen">
              Work
            </Link>
          </li>
          <li aria-current="page">{crumb}</li>
        </ol>
      </nav>
      <h1 className="case-title" tabIndex={-1}>
        {title}
      </h1>
      <p className="case-lede">{lede}</p>
      <dl className="case-meta">
        {meta.map((m) => (
          <div key={m.k}>
            <dt className="mono">{m.k}</dt>
            <dd>{m.v}</dd>
          </div>
        ))}
      </dl>
      {children}
    </header>
  );
}

export function LessonPlan({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="plan" aria-label="On this page">
      <p className="plan-h hand">lesson plan</p>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="pen">
              <span className="mono">{String(i + 1).padStart(2, "0")}</span> {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CaseSection({ id, n, title, children, wide = false }: { id: string; n: number; title: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <section id={id} className={`cs ${wide ? "cs-wide" : ""}`} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="cs-title" data-reveal>
        <span className="cs-n mono">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function NextCase({ to, label, title }: { to: string; label: string; title: string }) {
  return (
    <aside className="next-case wrap" aria-label="Next">
      <p className="mono">{label}</p>
      <Link to={to} className="next-link">
        <span>{title}</span> <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

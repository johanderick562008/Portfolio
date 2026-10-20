import type { ReactNode } from "react";
import type { Shot as ShotData } from "../data/freeboard";
import type { Project, Status } from "../data/projects";
import { periodOf, type SectionId } from "../data/timetable";
import { href } from "../routes";
import { Link } from "../router";

type HeadLayout = "split" | "stack" | "center" | "side" | "inline";

/**
 * Section head = a bell line (timetable cell, bell time, a rule that draws
 * across), then the title. Layouts vary so the page doesn't repeat itself.
 */
export function SectionHead({
  id,
  title,
  kicker,
  aside,
  layout = "split",
  children,
}: {
  id: SectionId;
  title: ReactNode;
  kicker?: ReactNode;
  aside?: string;
  layout?: HeadLayout;
  children?: ReactNode;
}) {
  const p = periodOf(id);
  return (
    <header className={`sh sh-${layout}`} data-reveal>
      <p className="sh-bell">
        <span className={`cell cell-${p.kind}`}>
          <span className="cell-p">{p.period}</span>
          <span className="cell-bunk" aria-hidden="true">
            Free
          </span>
        </span>
        <span className="sh-time mono">
          <span className="sr-only">Period time </span>
          {p.start}–{p.end}
        </span>
        <span className="sh-rule" aria-hidden="true" />
      </p>
      <h2 id={`${id}-title`} className="sh-title">
        {title}
      </h2>
      {aside && (
        <p className="hand sh-aside" aria-hidden="true">
          {aside}
        </p>
      )}
      {kicker && <p className="sh-kicker">{kicker}</p>}
      {children}
    </header>
  );
}

const statusTone: Record<Status, string> = {
  Live: "live",
  "Complete · runs locally": "local",
  "Command-line program": "cli",
  "In browser": "live",
};

export function StatusTag({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span className={`status status-${statusTone[status]} ${className}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

/** External link: opens in a new tab, says so to screen readers, pen-stroke underline on hover. */
export function ExtLink({ href: url, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`ext pen ${className}`}>
      {children}
      <span className="ext-arrow" aria-hidden="true">
        ↗
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ProjectLinks({ p, caseLabel = "Read the case study" }: { p: Project; caseLabel?: string }) {
  return (
    <div className="p-links">
      {p.caseStudy && (
        <Link to={p.caseStudy} className="pen p-link-case">
          {caseLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
      {p.live.map((l) => (
        <ExtLink key={l.href} href={l.href} className="p-link-live">
          {l.label}
        </ExtLink>
      ))}
      {p.repo && <ExtLink href={p.repo}>Source on GitHub</ExtLink>}
    </div>
  );
}

export function Stack({ items, label = "Technology stack" }: { items: string[]; label?: string }) {
  return (
    <ul className="stack mono" aria-label={label}>
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

/** A responsive, lazily-loaded WebP screenshot with its intrinsic size reserved. */
export function Shot({ s, sizes, className = "", eager = false }: { s: ShotData; sizes: string; className?: string; eager?: boolean }) {
  const widths = [...s.widths].sort((a, b) => a - b);
  return (
    <img
      className={`shot ${className}`}
      src={href(`${s.src}-${widths[widths.length - 1]}.webp`)}
      srcSet={widths.map((w) => `${href(`${s.src}-${w}.webp`)} ${w}w`).join(", ")}
      sizes={sizes}
      width={s.w}
      height={s.h}
      alt={s.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

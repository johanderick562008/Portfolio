import type { ReactNode } from "react";

/**
 * Blue-ink handwriting: the notebook's margin notes.
 * Decorative asides; the real content never lives only in here.
 */
export function Hand({ children, className = "", as: Tag = "span" }: { children: ReactNode; className?: string; as?: "span" | "p" }) {
  return <Tag className={`hand ${className}`}>{children}</Tag>;
}

const ARROWS = {
  // hand-drawn curves, each ending in a small open arrowhead
  "down-right": "M6 4 C 10 30, 30 44, 58 46 M48 38 L58 46 L47 53",
  "down-left": "M58 4 C 54 30, 34 44, 6 46 M16 38 L6 46 L17 53",
  "up-left": "M58 54 C 52 26, 34 12, 8 10 M18 3 L8 10 L19 17",
  "up-right": "M6 54 C 12 26, 30 12, 56 10 M46 3 L56 10 L45 17",
  down: "M30 2 C 22 18, 38 30, 30 50 M22 42 L30 51 L37 41",
  left: "M60 30 C 44 22, 26 36, 6 28 M15 20 L6 28 L16 35",
  right: "M4 28 C 20 36, 38 22, 58 30 M49 22 L58 30 L48 37",
} as const;
export type ArrowDir = keyof typeof ARROWS;

/** An ink arrow that draws itself when it scrolls into view. */
export function Arrow({ dir, className = "" }: { dir: ArrowDir; className?: string }) {
  return (
    <svg className={`arrow ${className}`} viewBox="0 0 64 58" width="64" height="58" aria-hidden="true" data-ink>
      <path d={ARROWS[dir]} pathLength={1} />
    </svg>
  );
}

/** A hand-drawn ring around something, drawn in when seen. */
export function Circle({ className = "" }: { className?: string }) {
  return (
    <svg className={`ink-circle ${className}`} viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden="true" data-ink>
      <path d="M62 6 C 26 3, 4 14, 6 27 C 8 42, 46 47, 78 44 C 108 41, 118 30, 112 18 C 106 7, 80 3, 50 7" pathLength={1} />
    </svg>
  );
}

/** Highlighter swipe behind a phrase; sweeps in when it scrolls into view. */
export function Mark({ children }: { children: ReactNode }) {
  return (
    <mark className="swipe" data-ink>
      {children}
    </mark>
  );
}

/** Letters that go soft and wonky under the pointer (Fraunces SOFT/WONK axes). */
export function Wonky({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`wonky ${className}`}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-sp" aria-hidden="true">
            {" "}
          </span>
        ) : (
          <span key={i} className="w" aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

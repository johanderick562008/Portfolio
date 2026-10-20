import { useEffect, useRef } from "react";
import { site } from "../config/site";
import { TIMETABLE } from "../data/timetable";
import { useClientValue, useScrolled, type Theme } from "../hooks/hooks";
import { Link } from "../router";

export const SECTION_IDS = TIMETABLE.map((s) => s.id);

export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 8v11a4 4 0 0 1-8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <path d="M17 8h3a8 8 0 0 1 0 16h-3z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="16" r="1.4" className="mark-dot" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className={`theme-ico ${theme}`}>
      <circle cx="9" cy="9" r="4" className="sun" />
      <g className="rays">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="9" y1="1.5" x2="9" y2="3.2" transform={`rotate(${i * 45} 9 9)`} />
        ))}
      </g>
      <circle cx="12" cy="6" r="4" className="bite" />
    </svg>
  );
}

interface Props {
  home: boolean;
  active: string;
  /** The timetable strip appears once the hero's timetable has scrolled away. */
  docked: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}

export function Nav({ home, active, docked, theme, onToggleTheme, onOpenPalette }: Props) {
  const { scrolled } = useScrolled();
  const stripRef = useRef<HTMLElement>(null);
  const isMac = useClientValue(() => /Mac|iPhone|iPad/.test(navigator.platform), false);

  // How far through the current period the reader is: the cell fills like a progress bar.
  useEffect(() => {
    const strip = stripRef.current;
    if (!home || !strip) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = active ? document.getElementById(active) : null;
      let p = 0;
      if (el) {
        const r = el.getBoundingClientRect();
        p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      }
      strip.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active, home]);

  // The bell: when the period changes, the new cell rings once.
  const prev = useRef(active);
  useEffect(() => {
    if (!active || active === prev.current) return;
    prev.current = active;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cell = stripRef.current?.querySelector<HTMLElement>(`[data-cell="${active}"]`);
    cell?.animate(
      [
        { transform: "rotate(0)" },
        { transform: "rotate(-4deg) scale(1.06)" },
        { transform: "rotate(3deg) scale(1.04)" },
        { transform: "rotate(-1.5deg)" },
        { transform: "rotate(0)" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [active]);

  return (
    <>
      <header className={`topbar ${scrolled || !home ? "is-scrolled" : ""}`}>
        <div className="topbar-inner wrap">
          <Link to="/" className="brand" aria-label={`${site.name}, home`}>
            <Monogram />
            <span className="brand-name">Johan Derick</span>
          </Link>
          {!home && (
            <Link to="/#work" className="pen back-link">
              <span aria-hidden="true">←</span> All work
            </Link>
          )}
          <div className="tools">
            <button type="button" className="tool-btn kbd-btn" onClick={onOpenPalette} aria-label={`${isMac ? "⌘" : "Ctrl"} K, quick navigation`} aria-keyshortcuts="Control+K Meta+K">
              <kbd>{isMac ? "⌘" : "Ctrl"}</kbd> <kbd>K</kbd>
            </button>
            <button
              type="button"
              className="tool-btn theme-btn"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Lights on" : "Lights off"}
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>
      </header>

      {home && (
        <nav ref={stripRef} aria-label="Timetable" className={`tt ${docked ? "is-docked" : ""}`}>
          <ol className="tt-row">
            {TIMETABLE.map((s, i) => {
              const on = active === s.id;
              return (
                <li key={s.id} className={s.kind === "break" ? "tt-li-break" : undefined} style={{ ["--i" as string]: i }}>
                  <Link
                    to={`/#${s.id}`}
                    data-cell={s.id}
                    aria-current={on ? "location" : undefined}
                    className={`tt-cell tt-${s.kind} ${on ? "is-on" : ""}`}
                  >
                    <span className="tt-p">
                      {s.period === "Recess" ? <span aria-hidden="true">R</span> : s.period}
                      <span className="tt-bunk" aria-hidden="true">
                        Free
                      </span>
                    </span>
                    <span className="tt-l">{s.label}</span>
                    {on && <span className="tt-fill" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}

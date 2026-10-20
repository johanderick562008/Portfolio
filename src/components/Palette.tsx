import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "../config/site";
import { featured } from "../data/projects";
import { TIMETABLE } from "../data/timetable";
import { useScrolled } from "../hooks/hooks";
import { navigate } from "../router";

interface Cmd {
  id: string;
  group: "Go to" | "Open" | "Do";
  label: string;
  hint?: string;
  run: () => void;
}

export function Palette({ open, onClose, onToggleTheme }: { open: boolean; onClose: () => void; onToggleTheme: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const cmds = useMemo<Cmd[]>(() => {
    const ext = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");
    const go = (to: string) => () => void navigate(to);
    const list: Cmd[] = [
      { id: "top", group: "Go to", label: "Top", run: go("/#top") },
      ...TIMETABLE.map((s) => ({ id: s.id, group: "Go to" as const, label: s.label, hint: s.period, run: go(`/#${s.id}`) })),
      { id: "fb", group: "Go to", label: "FreeBoard case study", hint: "page", run: go("/work/freeboard") },
      { id: "risk", group: "Go to", label: "Risk Predictor case study", hint: "page", run: go("/work/risk-predictor") },
      { id: "index", group: "Go to", label: "Index of all work", run: go("/#index-title") },
      { id: "cricket", group: "Do", label: "Play Hand Cricket", hint: "recess", run: go("/#cricket-title") },
      { id: "ttt", group: "Do", label: "Play Tic Tac Toe", hint: "recess", run: go("/#ttt-title") },
      { id: "flames", group: "Do", label: "Play FLAMES", hint: "recess", run: go("/#flames-title") },
      { id: "rps", group: "Do", label: "Play Rock Paper Scissors", hint: "recess", run: go("/#rps-title") },
      { id: "fb-live", group: "Open", label: "FreeBoard, the live app", hint: "new tab", run: ext(featured.freeboard.live[0].href) },
      { id: "gh", group: "Open", label: "GitHub profile", hint: "new tab", run: ext(site.links.github) },
      { id: "theme", group: "Do", label: "Toggle light / dark theme", run: onToggleTheme },
      { id: "print", group: "Do", label: "Print as a one-page résumé", run: () => window.print() },
    ];
    if (site.links.linkedin) list.push({ id: "li", group: "Open", label: "LinkedIn", hint: "new tab", run: ext(site.links.linkedin) });
    const order = ["Go to", "Do", "Open"];
    return list.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
  }, [onToggleTheme]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? cmds.filter((c) => `${c.group} ${c.label} ${c.hint ?? ""}`.toLowerCase().includes(t)) : cmds;
  }, [cmds, q]);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      setQ("");
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocus.current?.focus?.();
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const run = (c: Cmd) => {
    onClose();
    // Let the dialog unmount (and focus return) before scrolling.
    requestAnimationFrame(() => c.run());
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => (filtered.length ? (s + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter" && filtered[sel]) {
      e.preventDefault();
      run(filtered[sel]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog.
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  let lastGroup = "";
  return (
    <div className="pal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="pal" role="dialog" aria-modal="true" aria-label="Quick navigation" onKeyDown={onKey}>
        <div className="pal-input">
          <span className="mono" aria-hidden="true">›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a section, project or link…"
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-activedescendant={filtered[sel] ? `pal-${filtered[sel].id}` : undefined}
            aria-autocomplete="list"
          />
          <kbd className="mono">Esc</kbd>
        </div>
        <ul id="pal-list" role="listbox" className="pal-list">
          {filtered.length === 0 && <li className="pal-empty">Nothing matches "{q}".</li>}
          {filtered.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.id} role="presentation">
                {header && <p className="mono pal-group" aria-hidden="true">{header}</p>}
                <div
                  id={`pal-${c.id}`}
                  role="option"
                  aria-selected={i === sel}
                  className={`pal-item ${i === sel ? "is-sel" : ""}`}
                  onMouseMove={() => setSel(i)}
                  onClick={() => run(c)}
                >
                  <span>{c.label}</span>
                  {c.hint && <span className="mono pal-hint">{c.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mono pal-foot">↑↓ move · ↵ open · esc close</p>
      </div>
    </div>
  );
}

export function BackToTop() {
  const { far } = useScrolled();
  return (
    <button
      type="button"
      className={`to-top ${far ? "is-shown" : ""}`}
      onClick={() => void navigate("/#top")}
      tabIndex={far ? 0 : -1}
      aria-hidden={!far}
    >
      <span aria-hidden="true">↑</span> <span className="mono">Top</span>
    </button>
  );
}

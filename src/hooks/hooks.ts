import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const THEME_KEY = "jd-theme";
const noop = () => () => {};

/**
 * A value that only exists in the browser (clock, platform, storage). The server
 * and the hydrating client both render `server`; the real value follows straight
 * after, with no hydration mismatch.
 */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(noop, get, () => server);
}

/* ---------------------------------------------------------------- theme --- */

const themeListeners = new Set<() => void>();
const systemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function readTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "dark" || t === "light" ? t : systemTheme();
}
function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onOS = () => {
    if (!storedTheme()) setTheme(systemTheme(), false);
  };
  mq.addEventListener("change", onOS);
  return () => {
    themeListeners.delete(cb);
    mq.removeEventListener("change", onOS);
  };
}
function setTheme(t: Theme, remember: boolean) {
  document.documentElement.dataset.theme = t;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", t === "dark" ? "#0b1220" : "#f3f0e8"));
  if (remember) {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* storage unavailable: still switch for this visit */
    }
  }
  themeListeners.forEach((l) => l());
}

/** Follows the OS until the visitor picks a theme; the choice is remembered per browser. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, readTheme, () => "light");
  const toggle = useCallback(() => setTheme(readTheme() === "dark" ? "light" : "dark", true), []);
  return { theme, toggle };
}

/* --------------------------------------------------------------- scroll --- */

/** The section currently under the reading line (35% from the top). */
export function useActiveSection(ids: readonly string[], enabled = true) {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom the last (short) section can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActive(current);
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
  }, [ids, enabled]);
  return enabled ? active : "";
}

export function useScrolled(threshold = 24) {
  const [state, setState] = useState({ scrolled: false, far: false });
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > threshold;
      const far = window.scrollY > window.innerHeight * 1.5;
      setState((s) => (s.scrolled === scrolled && s.far === far ? s : { scrolled, far }));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return state;
}

/**
 * Adds `is-in` to `[data-reveal]` and `[data-ink]` elements as they enter the
 * viewport. Content is visible without JS; `html.js` opts into the motion.
 */
export function useReveal(key: string) {
  useEffect(() => {
    const SEL = "[data-reveal]:not(.is-in),[data-ink]:not(.is-in)";
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(SEL).forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const watch = (root: ParentNode) => root.querySelectorAll(SEL).forEach((el) => io.observe(el));
    watch(document);
    // Ink and cards that mount later (game boards, the visitor's clock note) get the same treatment.
    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(SEL)) io.observe(n);
          watch(n);
        });
    });
    mo.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [key]);
}

/* ----------------------------------------------------------------- time --- */

/** The visitor's clock, refreshed each minute. `null` during prerender/hydration. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      t = setTimeout(tick, (60 - d.getSeconds()) * 1000 + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return now;
}

/* ----------------------------------------------------------------- ping --- */

export type Ping = { k: "checking" } | { k: "up"; ms: number } | { k: "down" };

/**
 * Real reachability check from the visitor's browser. `no-cors` gives an
 * opaque response, which is enough to know the server answered, and how fast.
 */
export function usePing(url: string): Ping {
  const [state, setState] = useState<Ping>({ k: "checking" });
  useEffect(() => {
    let alive = true;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const t0 = performance.now();
    fetch(url, { mode: "no-cors", cache: "no-store", signal: ctl.signal })
      .then(() => alive && setState({ k: "up", ms: Math.round(performance.now() - t0) }))
      .catch(() => alive && setState({ k: "down" }))
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      ctl.abort();
      clearTimeout(timer);
    };
  }, [url]);
  return state;
}

/* ------------------------------------------------------------ key codes --- */

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Calls `onCode` when ↑↑↓↓←→←→BA is typed outside a text field. */
export function useKonami(onCode: () => void) {
  const cb = useRef(onCode);
  useEffect(() => {
    cb.current = onCode;
  });
  useEffect(() => {
    let recent: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      recent = [...recent, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (recent.join() === KONAMI.join()) {
        recent = [];
        cb.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

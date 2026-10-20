import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Footer } from "./components/Contact";
import { Nav, SECTION_IDS } from "./components/Nav";
import { BackToTop, Palette } from "./components/Palette";
import { PrintSheet } from "./components/PrintSheet";
import { useActiveSection, useKonami, useReveal, useTheme } from "./hooks/hooks";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { usePath } from "./router";
import { META, getPage, loadPage, matchRoute, registerPage, type RouteKey } from "./routes";

registerPage("home", Home);
registerPage("notfound", NotFound);

/** Docks the nav timetable once the hero's "Today's timetable" card has scrolled away. */
function useDocked(home: boolean) {
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const card = home ? document.getElementById("today") : null;
    if (!card || !("IntersectionObserver" in window)) {
      setDocked(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setDocked(!e.isIntersecting && e.boundingClientRect.top < 64), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(card);
    return () => io.disconnect();
  }, [home]);
  return docked;
}

export default function App() {
  const path = usePath();
  const key = matchRoute(path);
  const home = key === "home";
  const { theme, toggle } = useTheme();
  const [palette, setPalette] = useState(false);
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  const shownKey = useRef<RouteKey>(key);

  // Back/Forward to a page whose chunk isn't loaded yet: keep the current page until it is.
  const Page = getPage(key) ?? getPage(shownKey.current) ?? Home;
  useEffect(() => {
    if (getPage(key)) shownKey.current = key;
    else void loadPage(key).then(rerender);
  }, [key]);

  const active = useActiveSection(SECTION_IDS, home);
  const docked = useDocked(home);
  // The mobile bottom strip reserves space at the bottom of the page only while it's showing.
  useEffect(() => {
    document.documentElement.classList.toggle("strip-docked", home && docked);
  }, [home, docked]);
  useReveal(path);

  // Head tags on client-side navigation (the prerender writes them for first load).
  useEffect(() => {
    const m = META[key];
    document.title = m.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", m.description);
  }, [key]);

  // Restore scroll position on Back/Forward.
  useEffect(() => {
    const onPop = () => requestAnimationFrame(() => window.scrollTo(0, (history.state as { y?: number } | null)?.y ?? 0));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const closePalette = useCallback(() => setPalette(false), []);

  // Easter egg 1: attend every period (and reach the bell) for a stamp in the footer.
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (active) setVisited((v) => (v.has(active) ? v : new Set(v).add(active)));
  }, [active]);
  const fullAttendance = home && SECTION_IDS.every((id) => visited.has(id));

  // Easter egg 2: ↑↑↓↓←→←→BA bunks class. Every period becomes a free period.
  const [bunk, setBunk] = useState(false);
  useKonami(() => setBunk((b) => !b));
  useEffect(() => {
    document.documentElement.toggleAttribute("data-bunk", bunk);
  }, [bunk]);

  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Nav home={home} active={active} docked={docked} theme={theme} onToggleTheme={toggle} onOpenPalette={() => setPalette(true)} />
      <main id="main" tabIndex={-1}>
        <Page />
      </main>
      <Footer fullAttendance={fullAttendance} />
      <BackToTop />
      <Palette open={palette} onClose={closePalette} onToggleTheme={toggle} />
      <p className={`bunk-note ${bunk ? "is-on" : ""}`} role="status">
        {bunk && (
          <>
            <span className="hand">bunking.</span> Every period is a free period now. Type the code again to go back to class.
          </>
        )}
      </p>
      <PrintSheet />
    </>
  );
}

import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { Bench } from "./components/Bench";
import { Recess } from "./components/Recess";
import { About, Journey, Notes, Skills } from "./components/Sections";
import { WorkIndex } from "./components/WorkIndex";
import { registerSection } from "./deferred";
import FreeBoardCase from "./pages/FreeBoardCase";
import RiskCase from "./pages/RiskCase";
import { setServerPath } from "./router";
import { META, matchRoute, registerPage } from "./routes";

// On the server every page is bundled directly; the client loads case studies as chunks.
registerPage("freeboard", FreeBoardCase);
registerPage("risk", RiskCase);
Object.entries({ bench: Bench, index: WorkIndex, about: About, recess: Recess, skills: Skills, notes: Notes, journey: Journey }).forEach(([name, c]) =>
  registerSection(name, c),
);

/** Used by scripts/prerender.mjs at build time. */
export function render(url: string) {
  setServerPath(url);
  const key = matchRoute(url);
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return { html, key, meta: META[key] };
}

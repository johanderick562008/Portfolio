import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/notebook.css";
import "./styles/home.css";
import "./styles/games.css";
import "./styles/case.css";
import "./styles/print.css";
import App from "./App";
import { loadPage, matchRoute } from "./routes";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function start() {
  const key = matchRoute(window.location.pathname);
  // Load the current page's chunk first, so hydration matches the prerendered HTML exactly.
  void loadPage(key).then(() => {
    const root = document.getElementById("root")!;
    const app = (
      <StrictMode>
        <App />
      </StrictMode>
    );
    // Hydrate only HTML prerendered for this route. A host that falls back to
    // index.html for unknown paths gets a clean client render instead.
    if (root.dataset.route === key) hydrateRoot(root, app);
    else {
      root.replaceChildren();
      createRoot(root).render(app);
    }
  });
}

// In production the prerender only loads this bundle after the first paint, so
// hydration can start straight away; in dev it renders from scratch.
start();

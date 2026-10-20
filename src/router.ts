import { createElement, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { href, loadPage, matchRoute, normalize } from "./routes";

/**
 * A ~60-line router: history API + useSyncExternalStore. Navigation loads the
 * next page's chunk first, then swaps, so there is never a blank or spinner state.
 */

const listeners = new Set<() => void>();
let serverPath = "/";

export function setServerPath(p: string) {
  serverPath = normalize(p);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
  };
}

const getPath = () => normalize(window.location.pathname);

export function usePath(): string {
  // During hydration the "server" snapshot must be this page's own path: the HTML was prerendered for it.
  return useSyncExternalStore(subscribe, getPath, () => (typeof window === "undefined" ? serverPath : getPath()));
}

/** Smooth-scrolls to a section and moves focus there, without a second jump. */
export function scrollToId(id: string, opts: { smooth?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce || opts.smooth === false ? "auto" : "smooth", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  return true;
}

export async function navigate(to: string) {
  const url = new URL(href(to.startsWith("/") ? to : `/${to}`), window.location.href);
  const samePage = normalize(url.pathname) === getPath();
  const id = decodeURIComponent(url.hash.slice(1));

  if (samePage) {
    if (id) {
      history.replaceState(history.state, "", url.pathname + url.hash);
      scrollToId(id);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  await loadPage(matchRoute(url.pathname));
  // Remember where we were so Back returns to the same spot.
  history.replaceState({ ...(history.state ?? {}), y: window.scrollY }, "");
  history.pushState({ y: 0 }, "", url.pathname + url.search + url.hash);
  listeners.forEach((l) => l());
  // After React commits the new page:
  requestAnimationFrame(() => {
    if (!(id && scrollToId(id, { smooth: false }))) {
      window.scrollTo(0, 0);
      document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
    }
  });
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** An ordinary <a href>, upgraded to client-side navigation on plain left-clicks. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    void navigate(to);
  };
  return createElement("a", { href: href(to), onClick: handle, ...rest });
}

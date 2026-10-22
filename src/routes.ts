import type { ComponentType } from "react";

/**
 * Four routes. The home page ships in the main bundle; each case study is its
 * own chunk, loaded before the page is shown (never behind a spinner).
 * Head tags come from here both at build time (prerender) and on navigation.
 */
export type RouteKey = "home" | "freeboard" | "risk" | "notfound";

export interface RouteMeta {
  title: string;
  description: string;
  og: string;
  noindex?: boolean;
}

export const META: Record<RouteKey, RouteMeta> = {
  home: {
    title: "Johan Derick -Portfolio",
    description:
      "Johan Derick, a first-year B.Tech student building practical software with Python, FastAPI and MySQL. Flagship project: FreeBoard, a live app for finding who's free between periods.",
    og: "/og/home.png",
  },
  freeboard: {
    title: "FreeBoard case study · Johan Derick",
    description:
      "How I built FreeBoard: the problem, the schema, Google sign-in with httpOnly JWT cookies, and why I removed OCR for a manual timetable builder.",
    og: "/og/freeboard.png",
  },
  risk: {
    title: "Student Academic Risk Predictor case study · Johan Derick",
    description:
      "A model that rediscovered its own labelling rule, a perfect score that turned out to be leakage, and what proxy labels can't tell you.",
    og: "/og/risk.png",
  },
  notfound: {
    title: "Bunked · page not found · Johan Derick",
    description: "You've bunked into a page that doesn't exist.",
    og: "/og/home.png",
    noindex: true,
  },
};

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

/** Strips the deploy base and trailing slash: "/work/freeboard/" -> "/work/freeboard". */
export function normalize(pathname: string): string {
  let p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  p = p.replace(/\/index\.html$/, "/").replace(/\/+$/, "");
  return p || "/";
}

export function href(path: string): string {
  return `${BASE}${path}` || "/";
}

export function matchRoute(pathname: string): RouteKey {
  const p = normalize(pathname);
  if (p === "/") return "home";
  if (p === "/work/freeboard") return "freeboard";
  if (p === "/work/risk-predictor") return "risk";
  return "notfound";
}

type PageModule = { default: ComponentType };
// The server bundle registers every page statically (entry-server.tsx), so it needs no loaders.
const loaders: Partial<Record<RouteKey, () => Promise<PageModule>>> = import.meta.env.SSR
  ? {}
  : {
      freeboard: () => import("./pages/FreeBoardCase"),
      risk: () => import("./pages/RiskCase"),
    };
const loaded: Partial<Record<RouteKey, ComponentType>> = {};

/** Registers pages that are bundled directly (home, 404, or everything on the server). */
export function registerPage(key: RouteKey, page: ComponentType) {
  loaded[key] = page;
}

export function getPage(key: RouteKey): ComponentType | undefined {
  return loaded[key];
}

export async function loadPage(key: RouteKey): Promise<ComponentType> {
  const have = loaded[key];
  if (have) return have;
  const mod = await loaders[key]!();
  loaded[key] = mod.default;
  return mod.default;
}

// Renders every route to static HTML after `vite build`, so first paint, SEO and
// no-JS visitors get real content. Also inlines the CSS, defers the app bundle
// until after first paint, and writes per-route head tags, font preloads, a
// 404.html that static hosts serve automatically, robots.txt and (when the site
// URL is known) a sitemap.
//
// Site URL, for absolute og:image / canonical links: SITE_URL, or Vercel's
// VERCEL_PROJECT_PRODUCTION_URL. Without one, those tags use relative paths.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const siteUrl = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")).replace(/\/$/, "");
const base = "/"; // keep in sync with `base` in vite.config.ts if you change it
const abs = (p) => (siteUrl ? `${siteUrl}${p}` : p);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The display face (hero name) and the body face are preloaded; nothing else is.
const assets = fs.readdirSync(path.join(dist, "assets"));
const font = (re) => assets.find((f) => re.test(f));
const preloadFonts = [font(/^fraunces-normal-.*\.woff2$/), font(/^plex-sans-400-.*\.woff2$/)]
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin />`);

const routes = [
  { url: "/", out: "index.html" },
  { url: "/work/freeboard", out: "work/freeboard/index.html" },
  { url: "/work/risk-predictor", out: "work/risk-predictor/index.html" },
  { url: "/404", out: "404.html" },
];

// Inline the stylesheet: one fewer render-blocking request on first paint.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
const inlineCss = cssLink ? `<style>${fs.readFileSync(path.join(dist, cssLink[1].replace(base, "")), "utf8")}</style>` : null;

// The HTML is complete without JS, so the app bundle is fetched only after the
// first paint: the prerendered page shows immediately, hydration follows.
const entryTag = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const deferredEntry = entryTag
  ? `<script type="module">
      let go = () => { go = () => {}; import("${entryTag[1]}"); };
      const painted = () => performance.getEntriesByType("paint").some((e) => e.name === "first-contentful-paint");
      if (painted()) go();
      else {
        try { new PerformanceObserver((list, obs) => { obs.disconnect(); setTimeout(() => go()); }).observe({ type: "paint" }); } catch {}
        setTimeout(() => go(), 2500);
      }
    </script>`
  : null;

for (const r of routes) {
  const { html, meta, key } = render(r.url);
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.noindex ? `<meta name="robots" content="noindex" />` : siteUrl ? `<link rel="canonical" href="${esc(abs(r.url))}" />` : "",
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Johan Derick" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    siteUrl && !meta.noindex ? `<meta property="og:url" content="${esc(abs(r.url))}" />` : "",
    `<meta property="og:image" content="${esc(abs(meta.og))}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
    .filter(Boolean)
    .join("\n    ");
  const preload = [...preloadFonts, ...(r.chunk ? chunkPreloads(r.chunk) : [])].join("\n    ");
  let page = inlineCss ? template.replace(cssLink[0], () => inlineCss) : template;
  if (deferredEntry) page = page.replace(entryTag[0], () => deferredEntry);
  page = page
    .replace(/<!--head-->[\s\S]*?<!--\/head-->/, head)
    .replace("<!--preload-->", preload)
    .replace('<div id="root"></div>', `<div id="root" data-route="${key}">${html}</div>`);
  const file = path.join(dist, r.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page);
  console.log(`prerendered ${r.url.padEnd(22)} → dist/${r.out}  (${(page.length / 1024).toFixed(1)} kB)`);
}

fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ""}`);
if (siteUrl) {
  const urls = routes.filter((r) => r.url !== "/404").map((r) => `  <url><loc>${abs(r.url)}</loc></url>`);
  fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
}
fs.rmSync(ssrDir, { recursive: true, force: true });

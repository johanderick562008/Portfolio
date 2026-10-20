/**
 * FreeBoard case-study content. Every statement was checked against the
 * FreeBoard repository (backend/app/*, backend/schema.sql, frontend/js/*) in
 * October 2026. The Pings router exists in the code but isn't mounted in
 * main.py, so it is deliberately not described anywhere on this site.
 */

export const LIVE_URL = "https://freeboard-phi.vercel.app";
export const HEALTH_URL = "https://free-board-ashen.vercel.app/health";

export interface Shot {
  src: string;
  /** widths available as `${src}-${w}.webp` */
  widths: number[];
  w: number;
  h: number;
  alt: string;
  caption: string;
}

const shot = (name: string, widths: number[], w: number, h: number, alt: string, caption: string): Shot => ({
  src: `/work/freeboard/${name}`,
  widths,
  w,
  h,
  alt,
  caption,
});

/** Captured from the deployed frontend. Signed-in screens use sample people, not real students. */
export const SHOTS = {
  signin: shot("signin", [640, 1160], 1160, 640, "FreeBoard's sign-in card: the FreeBoard name, the line 'See who on your campus is free, right now.', and a single Continue with Google button.", "The whole sign-in page. No passwords to store, reset or leak."),
  live: shot("live", [800, 1600], 1600, 835, "FreeBoard's Live Now tab on a Tuesday at 11:20. A bar reads 'Classes on, Tuesday, 11:00 to 12:00, 4 of 5 free', above cards for the four free people and a chip showing one person in Workshop.", "Live Now: who on your board is free this period. It refreshes every 20 seconds."),
  browse: shot("browse", [800, 1600], 1600, 765, "FreeBoard's Browse tab: day buttons Monday to Friday, eight period buttons from 08:45 to 05:15, and two boxes listing who is free and who is in class.", "Browse: any day, any period."),
  builder: shot("builder", [800, 1600], 1600, 552, "The timetable builder: a subject box set to 'Free', Apply to selected, Mark Free, Clear and Clear All buttons, '3 slots selected', and a five-day by eight-period grid with three cells outlined.", "The builder that replaced OCR: select cells, type a subject or 'Free', apply."),
  together: shot("together", [800, 1600], 1600, 913, "FreeBoard's Free Together tab with three people ticked, listing the periods when all three are free: Tuesday 11:00, Wednesday 02:00, Thursday 04:15 and Friday 01:00.", "Free Together: the periods when everyone you pick is free."),
  mobile: shot("live-mobile", [390, 780], 780, 1540, "FreeBoard's Live Now tab on a phone, with the tabs wrapping onto two rows and free people shown as a two-column grid of cards.", "On a phone, where it actually gets used."),
};

export const FEATURES: { t: string; d: string }[] = [
  { t: "Google sign-in", d: "OAuth 2.0 through Authlib. No passwords." },
  { t: "Timetable builder", d: "Select cells, type a subject or Free, apply." },
  { t: "Live", d: "Who on your board is free this period." },
  { t: "Together", d: "Periods when everyone you pick is free." },
  { t: "Connections", d: "Requests, plus nicknames only you can see." },
  { t: "Your own bell", d: "Set your college's period times." },
];

export interface Decision {
  id: string;
  title: string;
  body: string;
  code?: string;
  source: string;
}

export const DECISIONS: Decision[] = [
  {
    id: "ocr",
    title: "I removed the clever feature",
    body:
      "An earlier version read timetables from a photo with OCR. A timetable that's mostly right isn't good enough here: one misread period and the app tells you a friend is free while they're in a lab. So I took OCR out and built a manual builder instead. You select cells, type a subject or \"Free\" and apply. It's quick, and the data is correct every time. The schema still has a source column with 'manual' and 'ocr' in it, left over from the old version.",
    code: `source ENUM('manual','ocr') NOT NULL DEFAULT 'manual'`,
    source: "backend/schema.sql",
  },
  {
    id: "slot",
    title: "One row per period, enforced by the database",
    body:
      "A timetable isn't stored as one blob. Each period is its own row keyed by (user, day, slot), and a unique key on those three columns means MySQL itself rejects a duplicate. \"Who's free now?\" becomes a lookup of one (day, slot) pair across your board.",
    code: `UNIQUE KEY uniq_slot (user_id, day, slot_index)`,
    source: "backend/schema.sql",
  },
  {
    id: "cookie",
    title: "The server decides who you are",
    body:
      "Protected routes read the user from a signed JWT in an httpOnly cookie. They never trust a user id sent in a header or the body, and page scripts can't read the token at all.",
    code: `def get_current_user(request: Request, ...):
    """Reads the httpOnly session cookie, never trusts
    a header/body-supplied user id."""
    token = request.cookies.get(COOKIE_NAME)`,
    source: "backend/app/security.py",
  },
  {
    id: "edges",
    title: "Connections are one-way edges",
    body:
      "A connection is a row from owner to other with a status: pending, accepted or declined. Someone only appears on your board after they accept. The nickname lives on that row, so it's yours alone, and asking again after a decline resets the row to pending so the other person actually sees the new request.",
    code: `UNIQUE KEY uniq_edge (owner_user_id, other_user_id),
CHECK (owner_user_id <> other_user_id)`,
    source: "backend/schema.sql · routers/users.py",
  },
  {
    id: "bell",
    title: "Not every college rings the same bell",
    body:
      "Period times started as a constant. Then it was obvious that colleges run different structures, so each person can save their own periods (eight by default, up to sixteen). Someone else's timetable is always read against their periods, not yours.",
    code: `GET /settings/periods/{user_id}
PUT /settings/periods   # only ever your own`,
    source: "backend/app/routers/settings.py",
  },
  {
    id: "saturday",
    title: "Working Saturdays",
    body:
      "Most colleges don't have a fixed Saturday timetable; a working Saturday follows one weekday. On a Saturday, Live asks once whether it's a holiday or which weekday's timetable applies, and remembers the answer for that date only.",
    source: "frontend/js/app.js",
  },
];

export interface Column {
  name: string;
  type: string;
  key?: "PK" | "FK" | "UQ";
  note?: string;
}
export interface Table {
  name: string;
  columns: Column[];
  constraints: string[];
  note?: string;
}

export const SCHEMA: Table[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "BIGINT", key: "PK" },
      { name: "google_sub", type: "VARCHAR(255)", key: "UQ", note: "Google's stable user id" },
      { name: "email", type: "VARCHAR(255)", key: "UQ" },
      { name: "username", type: "VARCHAR(30)", key: "UQ", note: "chosen at sign-up, searchable" },
      { name: "display_name", type: "VARCHAR(100)" },
      { name: "avatar_url", type: "VARCHAR(500)" },
      { name: "privacy", type: "ENUM", note: "public · connections · private (default connections)" },
      { name: "created_at", type: "DATETIME" },
    ],
    constraints: ["INDEX idx_username (username)"],
  },
  {
    name: "timetable_entries",
    columns: [
      { name: "id", type: "BIGINT", key: "PK" },
      { name: "user_id", type: "BIGINT", key: "FK", note: "→ users.id, ON DELETE CASCADE" },
      { name: "day", type: "ENUM", note: "Monday … Friday" },
      { name: "slot_index", type: "TINYINT", note: "which period of the day" },
      { name: "label", type: "VARCHAR(80)", note: "subject, or 'Free'" },
      { name: "is_free", type: "BOOLEAN" },
      { name: "source", type: "ENUM", note: "'manual' · 'ocr' (left from v1)" },
      { name: "updated_at", type: "DATETIME" },
    ],
    constraints: ["UNIQUE uniq_slot (user_id, day, slot_index)"],
  },
  {
    name: "connections",
    columns: [
      { name: "id", type: "BIGINT", key: "PK" },
      { name: "owner_user_id", type: "BIGINT", key: "FK", note: "→ users.id, who asked" },
      { name: "other_user_id", type: "BIGINT", key: "FK", note: "→ users.id, who was asked" },
      { name: "status", type: "ENUM", note: "pending · accepted · declined" },
      { name: "nickname", type: "VARCHAR(100)", note: "owner's private label" },
      { name: "created_at", type: "DATETIME" },
    ],
    constraints: ["UNIQUE uniq_edge (owner_user_id, other_user_id)", "CHECK owner_user_id <> other_user_id"],
  },
  {
    name: "period_settings",
    columns: [
      { name: "user_id", type: "BIGINT", key: "PK", note: "one row per person" },
      { name: "slots_json", type: "JSON text", note: "[{start, end, label}, …]" },
    ],
    constraints: [],
    note: "Written by /settings/periods; people without a row get the default eight periods.",
  },
];

export interface AuthStep {
  from: Actor;
  to: Actor;
  label: string;
  detail: string;
  code?: string;
}
export type Actor = "browser" | "api" | "google" | "db";
export const ACTORS: { id: Actor; name: string; sub: string }[] = [
  { id: "browser", name: "Browser", sub: "static frontend" },
  { id: "api", name: "FastAPI", sub: "backend on Vercel" },
  { id: "google", name: "Google", sub: "OAuth 2.0" },
  { id: "db", name: "MySQL", sub: "Aiven" },
];

export const AUTH: AuthStep[] = [
  {
    from: "browser",
    to: "api",
    label: "GET /auth/google/login",
    detail: "\"Continue with Google\" is a plain link to the backend. No passwords, ever.",
  },
  {
    from: "api",
    to: "browser",
    label: "302 → Google, with state",
    detail: "Authlib generates the CSRF state and keeps it in a signed session cookie, then redirects to Google asking for openid, email and profile.",
    code: `return await oauth.google.authorize_redirect(
    request, settings.GOOGLE_REDIRECT_URI)`,
  },
  {
    from: "browser",
    to: "google",
    label: "Sign in and consent",
    detail: "The student signs in on Google's own page. FreeBoard never sees their password.",
  },
  {
    from: "google",
    to: "api",
    label: "GET /auth/google/callback?code&state",
    detail: "Google sends the browser back with a one-time code. Authlib checks the state matches before going any further.",
  },
  {
    from: "api",
    to: "google",
    label: "Exchange code → userinfo",
    detail: "The backend swaps the code for tokens and reads sub, email, name and picture.",
    code: `token = await oauth.google.authorize_access_token(request)
info = token["userinfo"]`,
  },
  {
    from: "api",
    to: "db",
    label: "Find or create by google_sub",
    detail: "Users are matched on Google's stable id, not their email. New users get a placeholder username and are asked to pick a real one.",
    code: `placeholder = f"user{google_sub[-8:]}"`,
  },
  {
    from: "api",
    to: "browser",
    label: "Set-Cookie + 302 → /app.html",
    detail: "A JWT (HS256, user id + expiry) goes into an httpOnly cookie. In production it's Secure and SameSite=None, because the frontend and the API are on different domains.",
    code: `response.set_cookie(key=COOKIE_NAME, value=token,
    httponly=True, secure=is_prod,
    samesite="none" if is_prod else "lax")`,
  },
  {
    from: "browser",
    to: "api",
    label: "fetch(…, { credentials: \"include\" })",
    detail: "Every API call sends the cookie. The server decodes it to find the user; a 401 sends the page back to sign-in.",
    code: `if (res.status === 401) {
  window.location.href = "index.html";
}`,
  },
];

export const TRADEOFFS: { chose: string; over: string; because: string; cost: string }[] = [
  { chose: "Manual timetable builder", over: "OCR from a photo", because: "The data is correct every time.", cost: "Each student types their timetable once." },
  { chose: "JWT in an httpOnly cookie", over: "A token in localStorage", because: "Page scripts can't read the session.", cost: "Cross-site cookies need SameSite=None, Secure and CORS with credentials." },
  { chose: "One row per period", over: "One JSON blob per timetable", because: "MySQL rejects duplicates, and \"who's free\" is a query.", cost: "Saving a timetable is a bulk upsert of many rows." },
  { chose: "Plain HTML, CSS and JS", over: "A frontend framework", because: "No build step; it deploys as static files.", cost: "Rendering is hand-written template strings." },
  { chose: "Google sign-in only", over: "Email and password", because: "No passwords to store, hash or reset.", cost: "Everyone needs a Google account." },
];

export const LESSONS: string[] = [
  "Cross-site cookies need SameSite=None, which only works with Secure. That's why the cookie settings change between local development and production.",
  "The first load was slow because three requests waited on each other. Sending them together with Promise.allSettled fixed it, and one failing no longer blanks the whole page.",
  "If a feature can give you wrong data, it isn't really a feature yet. Removing OCR made the app more useful.",
];

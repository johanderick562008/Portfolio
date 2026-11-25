/**
 * FreeBoard case-study content. Every statement was checked line by line
 * against the FreeBoard repository (backend/app/*, backend/schema.sql,
 * frontend/js/*, frontend/css/*) in November 2026. The database is TiDB Cloud
 * (see backend/app/database.py); the repo's README still says Aiven, which is
 * out of date. The Pings router exists in the code but isn't mounted in
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

/**
 * Captured in November 2026 from FreeBoard's current frontend code (the
 * November 2026 repo snapshot, unmodified), run locally against a stand-in
 * API that serves sample people only, with the clock set to Tuesday 11:20.
 * No real student data appears in any of them.
 */
export const SHOTS = {
  signin: shot("signin", [640, 1160], 1160, 640, "FreeBoard's sign-in card: the FreeBoard name, the line 'See who on your campus is free, right now.', and a single Continue with Google button.", "The whole sign-in page. No passwords to store, reset or leak."),
  live: shot("live", [800, 1600], 1600, 1075, "FreeBoard's Live Now tab on a Tuesday at 11:20. A bar reads 'Classes on, Tuesday, 11:00 to 12:00, 5 of 6 free'. Below it, group chips (All, Hostellers, Cricket team, Class), cards for the five free people, and a chip showing one person in Workshop.", "Live Now: who on your board is free this period, with your groups one tap away. It refreshes every 20 seconds."),
  browse: shot("browse", [800, 1600], 1600, 1091, "FreeBoard's Browse tab with Tuesday and the 12:00 period picked and the Hostellers group selected: one person free, three in class with their subjects.", "Browse: any day, any period, narrowed to one group."),
  builder: shot("builder", [800, 1600], 1600, 635, "The timetable builder: a subject box set to 'Free', Apply to selected, Mark Free, Clear and Clear All buttons, '3 slots selected', and a five-day by eight-period grid with three cells outlined.", "The builder that replaced OCR: select cells, type a subject or 'Free', apply."),
  together: shot("together", [800, 1600], 1600, 1187, "FreeBoard's Free Together tab with the Cricket team group picked, which ticks its three members, listing the periods when all three are free on Tuesday, Wednesday and Friday.", "Free Together: tap a group and see every period the whole group is free."),
  groups: shot("groups", [800, 1600], 1600, 960, "The Edit group dialog for 'Hostellers': a name field, six people with four ticked including 'You', '4 selected', and Delete group, Cancel and Save changes buttons.", "Groups: private shortcuts. Only you see them, and the server checks every member is on your board."),
  appearance: shot("appearance", [800, 1600], 1600, 1440, "The Appearance panel: a Doomsday special-edition card, theme previews for Classic Green, Midnight, Daylight, Sakura Night, Terminal and Custom, four font choices and a text-size switch.", "Appearance: themes, your own colours, fonts and text size, saved on your device only."),
  doomsday: shot("doomsday", [800, 1600], 1600, 1120, "Live Now in the Doomsday edition: a Cinzel wordmark, 'Doomsday edition' under it, smoky dark-green background, riveted iron cards and a helmeted knight watching from the right.", "The Doomsday edition: smoke, forged iron and The Warden in the background."),
  guide: shot("guide", [800, 1600], 1600, 1312, "The About FreeBoard dialog on its What's new tab, listing November 2026 updates: Appearance with Doomsday, themes, custom colours and fonts, then Groups and how they work in each tab.", "About FreeBoard: a how-to guide and a What's new tab, built into the app."),
  mobile: shot("live-mobile", [390, 780], 780, 1560, "FreeBoard's Live Now tab on a phone: tabs on two rows, the Classes on bar, group chips, and free people in a two-column grid of cards.", "On a phone, where it actually gets used."),
};

export const FEATURES: { t: string; d: string }[] = [
  { t: "Live Now", d: "Who on your board is free this period. Knows breaks, weekends and working Saturdays." },
  { t: "Browse", d: "Any day, any period: who's free and who's in class." },
  { t: "Free Together", d: "Every period, day by day, when everyone you pick is free." },
  { t: "Timetable builder", d: "Select cells, type a subject or Free, apply. Clear All for a new semester." },
  { t: "Connections", d: "Send, unsend, accept or decline requests. Nicknames only you see." },
  { t: "Groups", d: "Private shortcuts like Hostellers or Class that filter every view." },
  { t: "Your own bell", d: "Set your college's period times: 1 to 16 periods a day." },
  { t: "Appearance", d: "Five themes, your own colours, fonts, text size, and a Doomsday edition." },
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
      "A timetable isn't stored as one blob. Each period is its own row keyed by (user, day, slot), and a unique key on those three columns means the database itself rejects a duplicate. \"Who's free now?\" becomes a lookup of one (day, slot) pair across your board.",
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
    id: "signup",
    title: "No account until you pick a username",
    body:
      "Signing in with the wrong Google account by mistake shouldn't leave anything behind. So a new Google user isn't written to the database at all. Their Google details wait in a short-lived signed cookie, and the account is created only when they choose a username. Leave before that, and there's no trace. Any other session in that browser is signed out, so the sign-up screen is all you see.",
    code: `SIGNUP_MINUTES = 30
# the ONLY place a new account is created
def _finish_signup(request, body, db): ...`,
    source: "backend/app/security.py · routers/users.py",
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
    id: "groups",
    title: "Groups are private, and the server checks them",
    body:
      "Groups are named lists like Hostellers or Cricket team. The browser uses them to filter Live Now, Browse and People, and in Free Together a group ticks exactly its members. The server still checks everything: you can only add people from your own board, names are unique per person ignoring case, and someone you remove from your board quietly drops out of your groups.",
    code: `if not set(ids) <= _board_ids(db, user_id) | {user_id}:
    raise HTTPException(422, "You can only add people who are on your board.")`,
    source: "backend/app/routers/groups.py",
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
  {
    id: "tidb",
    title: "A database that fits serverless",
    body:
      "The backend runs as a serverless function on Vercel, and the database is TiDB Cloud, which is MySQL-compatible. TiDB Cloud only accepts encrypted connections, so the engine verifies its certificate with certifi's CA list; a local MySQL is left without TLS. Each warm function keeps one connection instead of a pool, and skips the extra health-check round trip.",
    code: `_connect_args = {} if _db_host in (None, "localhost", "127.0.0.1") \\
    else {"ssl": {"ca": certifi.where()}}
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args,
    pool_size=1, max_overflow=0, pool_pre_ping=False, pool_recycle=300)`,
    source: "backend/app/database.py",
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
      { name: "slot_index", type: "TINYINT", note: "which period of the day (0–15)" },
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
    name: "board_groups",
    columns: [
      { name: "id", type: "BIGINT", key: "PK" },
      { name: "owner_user_id", type: "BIGINT", key: "FK", note: "→ users.id, the only person who sees it" },
      { name: "name", type: "VARCHAR(40)", note: "unique per owner, ignoring case" },
      { name: "created_at", type: "DATETIME" },
    ],
    constraints: [],
    note: "Up to 30 groups per person.",
  },
  {
    name: "board_group_members",
    columns: [
      { name: "group_id", type: "BIGINT", note: "→ board_groups.id" },
      { name: "member_user_id", type: "BIGINT", key: "FK", note: "→ users.id, must be on the owner's board" },
    ],
    constraints: [],
    note: "Up to 200 people per group. Saving a group replaces its whole member list.",
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
  { id: "db", name: "TiDB Cloud", sub: "MySQL-compatible, TLS" },
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
    label: "Look up google_sub",
    detail: "Users are matched on Google's stable id, not their email. A known user is signed straight in. A new one is not saved yet: nothing is written to the database at this point.",
    code: `user = db.query(User).filter(User.google_sub == google_sub).first()`,
  },
  {
    from: "api",
    to: "browser",
    label: "Set-Cookie + 302 → /app",
    detail: "A known user gets a JWT (HS256, user id + expiry) in an httpOnly cookie. In production it's Secure and SameSite=None, because the frontend and the API are on different domains. A new user instead gets a 30-minute signed sign-up cookie and lands on /app?setup=1.",
    code: `response.set_cookie(key=COOKIE_NAME, value=token,
    httponly=True, secure=is_prod,
    samesite="none" if is_prod else "lax")`,
  },
  {
    from: "browser",
    to: "api",
    label: "POST /users/username",
    detail: "Only a new user sees this step. Choosing a username is the one place an account is created. The sign-up cookie is swapped for a real session, and a sign-up ticket can never be used as a login.",
    code: `if payload.get("typ") == "signup":   # a sign-up ticket is never a login
    raise KeyError("typ")`,
  },
  {
    from: "browser",
    to: "api",
    label: "fetch(…, { credentials: \"include\" })",
    detail: "Every API call sends the cookie. The server decodes it to find the user; a 401 sends the page back to sign-in.",
    code: `if (res.status === 401) {
  window.location.href = "/";
}`,
  },
];

export const TRADEOFFS: { chose: string; over: string; because: string; cost: string }[] = [
  { chose: "Manual timetable builder", over: "OCR from a photo", because: "The data is correct every time.", cost: "Each student types their timetable once." },
  { chose: "JWT in an httpOnly cookie", over: "A token in localStorage", because: "Page scripts can't read the session.", cost: "Cross-site cookies need SameSite=None, Secure and CORS with credentials." },
  { chose: "One row per period", over: "One JSON blob per timetable", because: "The database rejects duplicates, and \"who's free\" is a query.", cost: "Saving a timetable is a bulk upsert of many rows." },
  { chose: "Create the account at username time", over: "Create it on first Google sign-in", because: "A wrong-account sign-in leaves no trace.", cost: "Sign-up details wait in a short-lived signed cookie." },
  { chose: "Plain HTML, CSS and JS", over: "A frontend framework", because: "No build step; it deploys as static files.", cost: "Rendering is hand-written template strings." },
  { chose: "Google sign-in only", over: "Email and password", because: "No passwords to store, hash or reset.", cost: "Everyone needs a Google account." },
];

export const LESSONS: string[] = [
  "Cross-site cookies need SameSite=None, which only works with Secure. That's why the cookie settings change between local development and production.",
  "The first load was slow because three requests waited on each other. Sending them together with Promise.allSettled fixed it, and one failing no longer blanks the whole page.",
  "Logging out silently did nothing in production. A browser only deletes a cookie if the delete carries the same Secure and SameSite attributes the cookie was set with, so logout now clears it with exactly those.",
  "Logout used to answer with a redirect. fetch() followed it cross-site, failed on CORS, and the app never reached the sign-in page. Now it returns plain JSON and the page navigates on its own.",
  "If a feature can give you wrong data, it isn't really a feature yet. Removing OCR made the app more useful.",
];

/** New in November 2026 (frontend/js/groups.js, appearance.js, whatsnew.js, app.js). */
export const SINCE: { t: string; d: string }[] = [
  { t: "Groups", d: "Private shortcuts like Hostellers, Class or Cricket team. Pick one and Live Now, Browse and People show only those people; in Free Together it ticks the whole group." },
  { t: "Requests, Instagram-style", d: "Search shows Send request, Requested or ✓ Accepted. Tap Requested to unsend. Asking again after a decline really reaches them again." },
  { t: "Appearance", d: "Classic Green, Midnight, Daylight, Sakura Night and Terminal, your own two colours, four fonts and three text sizes. Saved per device, so friends keep their own look." },
  { t: "Doomsday edition", d: "A special theme with drifting smoke, iron cards, a launch screen and a tap effect. Both stay off when the device asks for reduced motion." },
  { t: "A guide inside the app", d: "The ⓘ button opens How to use FreeBoard, with small drawings of each screen, and What's new, which shows a dot until you've seen the latest update." },
  { t: "Safer sign-up and log-out", d: "No account until you pick a username, a way to switch Google accounts mid sign-up, and a log-out that asks first." },
];

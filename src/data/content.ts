/** Skills, engineering notes and the timeline. Edit freely as things change. */

export type Depth = "used" | "learning";

export interface SkillGroup {
  code: string;
  title: string;
  items: { name: string; depth: Depth; where?: string }[];
}

/**
 * `used` = used in a shipped or finished project (the `where` field says which).
 * `learning` = actively studying, not yet relied on in a project.
 */
export const skills: SkillGroup[] = [
  {
    code: "LANG",
    title: "Languages",
    items: [
      { name: "Python", depth: "used", where: "every project" },
      { name: "SQL", depth: "used", where: "FreeBoard, MiniOLX" },
      { name: "JavaScript", depth: "used", where: "FreeBoard, Tic Tac Toe" },
      { name: "HTML & CSS", depth: "used", where: "FreeBoard, Tic Tac Toe" },
      { name: "TypeScript", depth: "learning" },
    ],
  },
  {
    code: "API",
    title: "Backend",
    items: [
      { name: "FastAPI", depth: "used", where: "FreeBoard, MiniOLX" },
      { name: "REST API design", depth: "used", where: "FreeBoard" },
      { name: "OAuth 2.0 sign-in", depth: "used", where: "FreeBoard" },
      { name: "JWT cookie sessions", depth: "used", where: "FreeBoard" },
      { name: "Request validation (Pydantic)", depth: "used", where: "FreeBoard" },
      { name: "Rate limiting", depth: "used", where: "FreeBoard" },
    ],
  },
  {
    code: "DATA",
    title: "Databases",
    items: [
      { name: "MySQL", depth: "used", where: "FreeBoard, MiniOLX" },
      { name: "SQLAlchemy ORM", depth: "used", where: "FreeBoard" },
      { name: "Relational schema design", depth: "used", where: "FreeBoard" },
    ],
  },
  {
    code: "UI",
    title: "Frontend",
    items: [
      { name: "Responsive layouts", depth: "used", where: "FreeBoard" },
      { name: "Fetch / API integration", depth: "used", where: "FreeBoard" },
      { name: "React", depth: "learning" },
    ],
  },
  {
    code: "OPS",
    title: "Tools & workflow",
    items: [
      { name: "Git & GitHub", depth: "used", where: "all projects" },
      { name: "Vercel deployment", depth: "used", where: "FreeBoard" },
      { name: "venv & requirements", depth: "used", where: "all Python projects" },
      { name: "pytest", depth: "used", where: "Risk Predictor, MiniOLX" },
      { name: "Docker", depth: "learning" },
    ],
  },
  {
    code: "ML",
    title: "Machine learning",
    items: [
      { name: "pandas data cleaning", depth: "used", where: "Risk Predictor" },
      { name: "scikit-learn classifiers", depth: "used", where: "Risk Predictor" },
      { name: "Cross-validation & metrics", depth: "used", where: "Risk Predictor" },
      { name: "Streamlit", depth: "used", where: "Risk Predictor" },
      { name: "Data Structures & Algorithms", depth: "learning" },
    ],
  },
];

export interface Note {
  id: string;
  project: string;
  title: string;
  body: string;
  code?: string;
  source: string;
}

/** Every note is drawn from the actual source or README of the named project. */
export const notes: Note[] = [
  {
    id: "cookie",
    project: "FreeBoard",
    title: "The server decides who you are, not the request",
    body:
      "After Google sign-in, the backend issues a signed JWT and stores it in an httpOnly cookie, so page scripts can't read it. Protected routes read the user from that cookie. They never trust a user id sent in a header or the request body.",
    code: `response.set_cookie(
    key=COOKIE_NAME, value=token,
    httponly=True,
    secure=is_prod,
    samesite="none" if is_prod else "lax",
)`,
    source: "backend/app/security.py",
  },
  {
    id: "slot",
    project: "FreeBoard",
    title: "One row per period, enforced by the database",
    body:
      "A timetable is stored as entries keyed by (user, day, slot). A unique constraint on those three columns means the database itself rejects a duplicate period. \"Who's free now\" then becomes a single indexed lookup instead of parsing a schedule.",
    code: `UniqueConstraint("user_id", "day", "slot_index",
                 name="uniq_slot")`,
    source: "backend/app/models.py",
  },
  {
    id: "manual",
    project: "FreeBoard",
    title: "Choosing the reliable path over the clever one",
    body:
      "An earlier version tried reading timetables from images with OCR. The schema still has a \"source\" column with \"manual\" and \"ocr\" values. The current version uses a manual timetable builder: entering five days of periods is quick, and it gives correct data every time.",
    source: "backend/app/models.py · freeboard-v2 notes",
  },
  {
    id: "rule",
    project: "Risk Predictor",
    title: "When the model only rediscovers the rule",
    body:
      "The selected decision tree learned exactly the attendance thresholds that were used to create the labels. It agreed with the attendance-only rule on 100% of test students. I reported that honestly: on this data, ML doesn't beat the transparent rule. The value is a reproducible, tested pipeline.",
    code: `Attendance <= 64.99  -> High
Attendance <= 74.99  -> Medium
otherwise            -> Low`,
    source: "README §11 · src/train_model.py",
  },
  {
    id: "leak",
    project: "Risk Predictor",
    title: "A perfect score was the warning sign",
    body:
      "Including Total_Score as a feature gave a Random Forest 1.000 accuracy on training and 0.9995 on test, because the labels were built from it. The final model excludes it. The leaked run stays in the report only as a reference, to show why it was removed.",
    source: "README §10–11",
  },
];

export interface Milestone {
  date: string;
  title: string;
  body: string;
}

/** Dates are the month each repository was first published on GitHub. */
export const journey: Milestone[] = [
  {
    date: "Jun 2026",
    title: "Python fundamentals, one program at a time",
    body: "Games, a banking program, pattern printers and a personal utility module, JDMOD.",
  },
  {
    date: "Jul 2026",
    title: "Logic-heavy programs",
    body: "Matrix operations, determinants and inverses, Indian-system number-to-words, and a browser Tic Tac Toe with an AI opponent.",
  },
  {
    date: "Aug 2026",
    title: "First full-stack product",
    body: "FreeBoard: FastAPI, MySQL, Google OAuth and a deployed frontend, used to coordinate free periods.",
  },
  {
    date: "Sep 2026",
    title: "A bigger backend",
    body: "MiniOLX, a marketplace learning project with checkout, stock locking and 90 automated tests.",
  },
  {
    date: "Oct 2026",
    title: "Machine learning, carefully",
    body: "The Academic Risk Predictor: data cleaning, leakage checks, model comparison and a Streamlit dashboard.",
  },
  {
    date: "Now",
    title: "Going deeper",
    body: "Backend architecture, Data Structures & Algorithms, and the fundamentals behind the models I use.",
  },
];

/** The "Now" index card. Update `updated` whenever the lines change. */
export const now = {
  updated: "Oct 2026",
  items: [
    ["Building", "improvements to FreeBoard"],
    ["Learning", "DSA & ML fundamentals"],
    ["Studying", "first-year B.Tech"],
  ] as [string, string][],
};

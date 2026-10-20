/**
 * Project data. Every claim here was checked against the repository source,
 * README or a live URL (October 2026). Keep it that way: if something isn't
 * implemented, describe it as planned or leave it out.
 */

export type Category = "Full Stack" | "Backend" | "Web" | "Python" | "Machine Learning";

export type Status =
  | "Live" // deployed and reachable
  | "Complete · runs locally" // finished, not hosted
  | "Command-line program" // Python terminal program
  | "In browser"; // static web build

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  kind: string;
  categories: Category[];
  status: Status;
  summary: string;
  stack: string[];
  repo: string | null;
  live: ProjectLink[];
  /** First published on GitHub (from the repo's created_at). */
  published: string;
  /** In-site case study route, if there is one. */
  caseStudy?: string;
  /** A playable browser port of this project exists in Recess. */
  playable?: string;
}

const gh = (repo: string) => `https://github.com/johanderick562008/${repo}`;

export const featured = {
  freeboard: {
    id: "freeboard",
    index: "01",
    title: "FreeBoard",
    kind: "Campus timetable & availability app",
    categories: ["Full Stack", "Backend"],
    status: "Live",
    summary:
      "See who's free right now. Students save their timetable once, connect with classmates, and FreeBoard answers the question everyone asks between periods.",
    stack: ["Python", "FastAPI", "SQLAlchemy", "MySQL (Aiven)", "Google OAuth 2.0", "JWT sessions", "SlowAPI", "HTML · CSS · JS", "Vercel"],
    repo: gh("FreeBoard"),
    live: [
      { label: "Open the app", href: "https://freeboard-phi.vercel.app" },
      { label: "API health", href: "https://free-board-ashen.vercel.app/health" },
    ],
    published: "Aug 2026",
    caseStudy: "/work/freeboard",
  },
  risk: {
    id: "risk",
    index: "02",
    title: "Student Academic Risk Predictor",
    kind: "Machine-learning pipeline & dashboard",
    categories: ["Machine Learning", "Python"],
    status: "Complete · runs locally",
    summary:
      "Cleans a 10,030-row student dataset, labels Low / Medium / High risk with a transparent rule, then tests whether ML models can do better than that rule. Results and recommendations are shown in a Streamlit dashboard.",
    stack: ["Python", "pandas", "scikit-learn", "matplotlib", "Streamlit", "pytest"],
    repo: gh("student-risk-prediction"),
    live: [],
    published: "Oct 2026",
    caseStudy: "/work/risk-predictor",
  },
} satisfies Record<string, Project>;

export const games: Project[] = [
  {
    id: "ttt-web",
    index: "R.1",
    title: "Tic Tac Toe (web)",
    kind: "Browser game",
    categories: ["Web"],
    status: "In browser",
    summary: "Chalkboard-style board with a single-player mode at several AI difficulty levels, plus local two-player.",
    stack: ["HTML", "CSS", "JavaScript"],
    repo: gh("tic_tac_toe"),
    live: [{ label: "Play", href: "https://johanderick562008.github.io/tic_tac_toe/" }],
    published: "Jul 2026",
    playable: "ttt",
  },
  {
    id: "ttt-cli",
    index: "R.2",
    title: "Tic Tac Toe",
    kind: "Terminal game",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Two-player game with win and draw detection and input validation.",
    stack: ["Python"],
    repo: gh("Tic-Tac-Toe"),
    live: [],
    published: "Jun 2026",
  },
  {
    id: "hand-cricket",
    index: "R.3",
    title: "Hand Cricket",
    kind: "Terminal game",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Batting and bowling turns against the computer, with score tracking.",
    stack: ["Python"],
    repo: gh("Hand-Cricket-"),
    live: [],
    published: "Jun 2026",
    playable: "cricket",
  },
  {
    id: "rps",
    index: "R.4",
    title: "Rock Paper Scissors",
    kind: "Terminal game",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Randomised computer moves and a simple prompt loop.",
    stack: ["Python"],
    repo: gh("Rock-Paper-Scissors"),
    live: [],
    published: "Jun 2026",
    playable: "rps",
  },
  {
    id: "flames",
    index: "R.5",
    title: "FLAMES",
    kind: "Terminal game",
    categories: ["Python"],
    status: "Command-line program",
    summary: "The classic name-elimination game, played at the command line.",
    stack: ["Python"],
    repo: gh("FLAMES"),
    live: [],
    published: "Jun 2026",
    playable: "flames",
  },
];

export const mathProjects: Project[] = [
  {
    id: "matrix",
    index: "03",
    title: "Matrix Calculator",
    kind: "Two Python programs",
    categories: ["Python"],
    status: "Command-line program",
    summary:
      "Addition, subtraction and multiplication (in either order) for 2×2 and 3×3 integer matrices, plus a companion program for determinants and inverses via cofactor expansion and the adjugate.",
    stack: ["Python"],
    repo: gh("Matrix-Calculator-"),
    live: [],
    published: "Jul 2026",
  },
  {
    id: "words",
    index: "04",
    title: "Number to Words",
    kind: "Python program",
    categories: ["Python"],
    status: "Command-line program",
    summary:
      "Converts a non-negative whole number into words using the Indian system (thousand, lakh, crore), and splits longer inputs so the crore part can itself be expressed in lakhs and thousands.",
    stack: ["Python"],
    repo: gh("Number-to-words"),
    live: [],
    published: "Jul 2026",
  },
];

/** Smaller programs, shown as an archive rather than featured work. */
export const archive: Project[] = [
  {
    id: "miniolx",
    index: "05.1",
    title: "MiniOLX",
    kind: "Learning-project marketplace",
    categories: ["Full Stack", "Backend"],
    status: "Complete · runs locally",
    summary:
      "OLX-style marketplace: listings with photos, Google sign-in, cart, checkout with stock locking and price snapshots, UPI QR payments verified by the seller, Razorpay test mode, and 90 automated tests.",
    stack: ["FastAPI", "MySQL", "JavaScript"],
    repo: gh("MiniOLX"),
    live: [],
    published: "Sep 2026",
  },
  {
    id: "determinant",
    index: "05.2",
    title: "Determinant & Inverse",
    kind: "Python program",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Determinant and inverse of 2×2 and 3×3 matrices; reports when no inverse exists.",
    stack: ["Python"],
    repo: gh("Determinant-Inverse"),
    live: [],
    published: "Jul 2026",
  },
  {
    id: "bank",
    index: "05.3",
    title: "Bank Management",
    kind: "Python program",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Account management with deposits, withdrawals and balance checks.",
    stack: ["Python"],
    repo: gh("Bank"),
    live: [],
    published: "Jun 2026",
  },
  {
    id: "jdmod",
    index: "05.4",
    title: "JDMOD",
    kind: "Python module",
    categories: ["Python"],
    status: "Command-line program",
    summary: "A personal utility module: maths, strings, number operations and patterns.",
    stack: ["Python"],
    repo: gh("JDMOD"),
    live: [],
    published: "Jun 2026",
  },
  {
    id: "patterns",
    index: "05.5",
    title: "Patterns",
    kind: "Python programs",
    categories: ["Python"],
    status: "Command-line program",
    summary: "Star, number and alphabet patterns built with nested loops.",
    stack: ["Python"],
    repo: gh("Patterns"),
    live: [],
    published: "Jun 2026",
  },
];

export const allCategories: ("All" | Category)[] = ["All", "Full Stack", "Backend", "Web", "Python", "Machine Learning"];

/** Everything, in the order the index lists it. */
export const EVERYTHING: Project[] = [featured.freeboard, featured.risk, ...mathProjects, ...games, ...archive];
export const PROJECT_COUNT = EVERYTHING.length;

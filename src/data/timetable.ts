/**
 * The page is laid out as a school day. Bell times are FreeBoard's own default
 * periods (backend/app/routers/settings.py), including its 15-minute break,
 * which this page uses for Recess. Nothing here describes Johan's real schedule.
 */

export type SectionId = "work" | "about" | "recess" | "skills" | "notes" | "journey" | "contact";

export interface Period {
  id: SectionId;
  /** What the timetable cell says: P1…P5, Recess, Free */
  period: string;
  label: string;
  start: string;
  end: string;
  blurb: string;
  kind: "class" | "break" | "free";
}

export const TIMETABLE: Period[] = [
  { id: "work", period: "P1", label: "Work", start: "08:45", end: "09:45", blurb: "FreeBoard, the Risk Predictor, the rest", kind: "class" },
  { id: "about", period: "P2", label: "About", start: "09:45", end: "10:45", blurb: "Who's building all this", kind: "class" },
  { id: "recess", period: "Recess", label: "Recess", start: "10:45", end: "11:00", blurb: "Four games you can play", kind: "break" },
  { id: "skills", period: "P3", label: "Skills", start: "11:00", end: "12:00", blurb: "Used in projects vs. learning", kind: "class" },
  { id: "notes", period: "P4", label: "Notes", start: "12:00", end: "13:00", blurb: "Decisions, with sources", kind: "class" },
  { id: "journey", period: "P5", label: "Journey", start: "13:00", end: "14:00", blurb: "June 2026 to now", kind: "class" },
  { id: "contact", period: "Free", label: "Contact", start: "14:00", end: "15:00", blurb: "Say hello", kind: "free" },
];

export const periodOf = (id: SectionId) => TIMETABLE.find((p) => p.id === id)!;

const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
/** FreeBoard's last default period ends at 17:15 (P7 and P8 aren't on this page). */
const DAY_END = mins("17:15");

export type Where =
  | { kind: "weekend"; day: string; time: string }
  | { kind: "before"; time: string }
  | { kind: "in"; id: SectionId; time: string }
  | { kind: "late"; time: string }
  | { kind: "after"; time: string };

/** Where the visitor's own clock falls on FreeBoard's default bell. */
export function whereAreYou(now: Date): Where {
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const day = now.getDay();
  if (day === 0 || day === 6) return { kind: "weekend", day: day === 0 ? "Sunday" : "Saturday", time };
  const m = now.getHours() * 60 + now.getMinutes();
  if (m < mins(TIMETABLE[0].start)) return { kind: "before", time };
  const p = TIMETABLE.find((x) => m >= mins(x.start) && m < mins(x.end));
  if (p) return { kind: "in", id: p.id, time };
  if (m < DAY_END) return { kind: "late", time };
  return { kind: "after", time };
}

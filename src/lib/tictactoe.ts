/**
 * Port of the AI from johanderick562008/tic_tac_toe (index.html), which is
 * itself a port of the original Python script. Same three levels, same rule
 * order. The only change: the repeated "two of a kind in this line" checks are
 * written once as `completeLine`, which picks exactly the same cell.
 *
 * Board cells are numbered 0–8, row by row. The player is X and moves first.
 */

export type Mark = "X" | "O" | "";
export type Board = Mark[];
export type Level = 1 | 2 | 3;

/** Same order as v1…v8 in the original: rows, columns, anti-diagonal, diagonal. */
export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [2, 4, 6], [0, 4, 8],
] as const;

export function winner(b: Board): { mark: "X" | "O"; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[c] === b[d]) return { mark: b[a] as "X" | "O", line };
  }
  return null;
}

export const isFull = (b: Board) => b.every((c) => c !== "");

const empty = (b: Board) => b.flatMap((c, i) => (c === "" ? [i] : []));
const pick = <T,>(xs: T[]): T | null => (xs.length ? xs[Math.floor(Math.random() * xs.length)] : null);

function easy(b: Board): number {
  return pick(empty(b))!;
}

/** First line (in order) holding two of `m` and one gap: return the gap. */
function completeLine(b: Board, m: "X" | "O"): number | null {
  for (const line of LINES) {
    const marks = line.filter((i) => b[i] === m).length;
    const gap = line.find((i) => b[i] === "");
    if (marks === 2 && gap !== undefined) return gap;
  }
  return null;
}

/** Both corners of a diagonal taken by X, centre by O, on the AI's 2nd move. */
const diagonalFork = (b: Board, round: number) =>
  ((b[0] === "X" && b[8] === "X") || (b[2] === "X" && b[6] === "X")) && b[4] === "O" && round === 2;

const EDGES = [1, 5, 7, 3];

function medium(b: Board, round: number): number {
  const win = completeLine(b, "O");
  if (win !== null) return win;
  if (diagonalFork(b, round)) {
    const e = pick(EDGES.filter((i) => b[i] === ""));
    if (e !== null) return e;
  }
  const block = completeLine(b, "X");
  if (block !== null) return block;
  return easy(b);
}

export interface Memory {
  /** The original's `q`: a follow-up owed after a specific opening. */
  q: 0 | 1 | 2;
}

function hard(b: Board, round: number, mem: Memory): number {
  if (round === 1 && b[4] === "X") return 0;
  if (b[4] === "X" && b[0] === "O" && (b[6] === "X" || b[8] === "X") && round === 2) return 2;
  if (b[4] === "" && round === 1) return 4;
  if (diagonalFork(b, round)) {
    const e = pick(EDGES.filter((i) => b[i] === ""));
    if (e !== null) return e;
  }
  if (b[4] === "O" && round === 2) {
    if (b[1] === "X" && b[5] === "X") return 2;
    if (b[7] === "X" && b[5] === "X") return 8;
    if (b[7] === "X" && b[3] === "X") return 6;
    if (b[1] === "X" && b[3] === "X") return 0;
    if (b[3] === "X" && b[5] === "X") {
      mem.q = 1;
      return 1;
    }
    if (b[1] === "X" && b[7] === "X") {
      mem.q = 2;
      return 5;
    }
  }
  if (mem.q === 1) {
    mem.q = 0;
    const c = pick([0, 2].filter((i) => b[i] === ""));
    if (c !== null) return c;
  }
  if (mem.q === 2) {
    mem.q = 0;
    const c = pick([2, 8].filter((i) => b[i] === ""));
    if (c !== null) return c;
  }
  return medium(b, round);
}

/** The AI's move as O. `round` counts the AI's moves, starting at 1. */
export function aiMove(b: Board, level: Level, round: number, mem: Memory): number {
  const mv = level === 1 ? easy(b) : level === 2 ? medium(b, round) : hard(b, round, mem);
  return b[mv] === "" ? mv : easy(b);
}

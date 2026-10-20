import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { aiMove, isFull, winner, type Board, type Level, type Memory } from "../../lib/tictactoe";

type Mode = Level | "2p";
const MODES: { id: Mode; label: string }[] = [
  { id: 1, label: "Easy" },
  { id: 2, label: "Medium" },
  { id: 3, label: "Hard" },
  { id: "2p", label: "2 players" },
];

const fresh = (): Board => Array(9).fill("");

/** Pen-drawn marks: two strokes for X, one loop for O. */
function MarkGlyph({ m }: { m: "X" | "O" }) {
  return m === "X" ? (
    <svg viewBox="0 0 40 40" className="ttt-x" aria-hidden="true">
      <path d="M9 9 C 17 16, 24 24, 31 31" pathLength={1} />
      <path d="M31 9 C 24 15, 16 24, 9 31" pathLength={1} />
    </svg>
  ) : (
    <svg viewBox="0 0 40 40" className="ttt-o" aria-hidden="true">
      <path d="M21 7 C 10 6, 6 15, 7 21 C 8 30, 16 34, 23 33 C 31 32, 35 24, 33 16 C 31 9, 24 6, 18 8" pathLength={1} />
    </svg>
  );
}

/** Centre of a cell in the 0–3 board coordinate system used by the win line. */
const centre = (i: number) => [(i % 3) + 0.5, Math.floor(i / 3) + 0.5];

export function TicTacToe() {
  const [mode, setMode] = useState<Mode>(2);
  const [board, setBoard] = useState<Board>(fresh);
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [thinking, setThinking] = useState(false);
  const [tally, setTally] = useState({ x: 0, o: 0, d: 0 });
  const [focus, setFocus] = useState(4);
  const round = useRef(1);
  const mem = useRef<Memory>({ q: 0 });
  const cells = useRef<(HTMLButtonElement | null)[]>([]);

  const win = winner(board);
  const draw = !win && isFull(board);
  const over = !!win || draw;
  const vsAi = mode !== "2p";

  const restart = (m: Mode = mode) => {
    setMode(m);
    setBoard(fresh());
    setTurn("X");
    setThinking(false);
    round.current = 1;
    mem.current = { q: 0 };
  };

  /** Places a move and, if it ends the game, counts the result. */
  const commit = (next: Board, nextTurn: "X" | "O") => {
    setBoard(next);
    setTurn(nextTurn);
    const w = winner(next);
    if (w) setTally((t) => (w.mark === "X" ? { ...t, x: t.x + 1 } : { ...t, o: t.o + 1 }));
    else if (isFull(next)) setTally((t) => ({ ...t, d: t.d + 1 }));
  };

  // The computer plays O after a short, readable pause (the original waits 700 ms).
  useEffect(() => {
    if (!vsAi || turn !== "O" || over) return;
    setThinking(true);
    const t = setTimeout(() => {
      const next = [...board];
      next[aiMove(board, mode as Level, round.current, mem.current)] = "O";
      round.current += 1;
      setThinking(false);
      commit(next, "X");
    }, 450);
    return () => clearTimeout(t);
  }, [turn, vsAi, over, mode, board]);

  const play = (i: number) => {
    if (over || board[i] || thinking || (vsAi && turn === "O")) return;
    const next = [...board];
    next[i] = turn;
    commit(next, turn === "X" ? "O" : "X");
  };

  // Arrow keys move around the grid (one tab stop for the whole board).
  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    let n = focus + moves[e.key];
    if (e.key === "ArrowLeft" && focus % 3 === 0) n = focus + 2;
    if (e.key === "ArrowRight" && focus % 3 === 2) n = focus - 2;
    n = (n + 9) % 9;
    setFocus(n);
    cells.current[n]?.focus();
  };

  const names = vsAi ? { X: "You", O: "Computer" } : { X: "Player 1 (X)", O: "Player 2 (O)" };
  const status = win
    ? vsAi
      ? win.mark === "X"
        ? mode === 3
          ? "You beat Hard mode!"
          : "You won!"
        : "Computer won."
      : `${names[win.mark]} won!`
    : draw
      ? "Match draw."
      : thinking
        ? "Computer thinking…"
        : vsAi
          ? "Your turn. You're X."
          : `${names[turn]}'s turn.`;

  const [a, , c] = win?.line ?? [];
  const [x1, y1] = win ? centre(a) : [0, 0];
  const [x2, y2] = win ? centre(c) : [0, 0];

  return (
    <div className="ttt">
      <div className="seg" role="group" aria-label="Opponent">
        {MODES.map((m) => (
          <button key={m.label} type="button" aria-pressed={mode === m.id} onClick={() => restart(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="ttt-wrap">
        <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board" onKeyDown={onGridKey}>
          {[0, 1, 2].map((r) => (
            <div role="row" key={r} className="ttt-r">
              {[0, 1, 2].map((col) => {
                const i = r * 3 + col;
                const v = board[i];
                return (
                  <span role="gridcell" key={i} className="ttt-gc">
                    <button
                      ref={(el) => {
                        cells.current[i] = el;
                      }}
                      type="button"
                      className={`ttt-cell ${win?.line.includes(i) ? "is-win" : ""}`}
                      tabIndex={focus === i ? 0 : -1}
                      onFocus={() => setFocus(i)}
                      onClick={() => play(i)}
                      aria-disabled={!!v || over || thinking || undefined}
                      aria-label={`Row ${r + 1}, column ${col + 1}, ${v ? (v === "X" ? "X" : "O") : "empty"}`}
                    >
                      {v && <MarkGlyph m={v} />}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {win && (
          <svg className="ttt-line" viewBox="0 0 3 3" aria-hidden="true">
            <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
          </svg>
        )}
      </div>

      <p className="game-status" role="status">
        {status}
      </p>
      <div className="ttt-foot">
        <p className="tally mono" aria-label={`This visit: ${names.X} ${tally.x}, draws ${tally.d}, ${names.O} ${tally.o}`}>
          <span>
            {vsAi ? "You" : "P1"} <b>{tally.x}</b>
          </span>
          <span>
            Draw <b>{tally.d}</b>
          </span>
          <span>
            {vsAi ? "Computer" : "P2"} <b>{tally.o}</b>
          </span>
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => restart()}>
          {over ? "Play again" : "Restart"}
        </button>
      </div>
      <p className="game-keys mono" aria-hidden="true">
        arrow keys + enter work too
      </p>
    </div>
  );
}

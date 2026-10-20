import { useState, type KeyboardEvent } from "react";
import { MOVES, decide, randomMove, type Move, type Outcome } from "../../lib/rps";

/** Doodled hands, drawn in the same pen as the margin notes. */
const GLYPH: Record<Move, string> = {
  r: "M12 30 C 8 22, 12 12, 21 11 C 29 10, 36 15, 36 23 C 37 31, 30 37, 22 36 C 17 36, 14 34, 12 30 Z M19 18 C 22 17, 26 18, 28 21",
  p: "M11 8 L 31 8 L 37 14 L 37 38 L 11 38 Z M31 8 L 31 14 L 37 14 M16 20 L 31 20 M16 26 L 31 26 M16 32 L 26 32",
  s: "M14 32 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M30 34 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M17 28 L 34 7 M27 30 L 14 7",
};

function Glyph({ m }: { m: Move }) {
  return (
    <svg viewBox="0 0 48 44" className="rps-g" aria-hidden="true">
      <path d={GLYPH[m]} />
    </svg>
  );
}

const SAY: Record<Outcome, string> = { you: "You Won", system: "System won", draw: "Match Draw" };
const name = (m: Move) => MOVES.find((x) => x.id === m)!.name;

export function RockPaperScissors() {
  const [last, setLast] = useState<{ you: Move; sys: Move; out: Outcome } | null>(null);
  const [n, setN] = useState(0);
  const [score, setScore] = useState({ you: 0, system: 0, draw: 0 });

  const play = (you: Move) => {
    const sys = randomMove();
    const out = decide(you, sys);
    setLast({ you, sys, out });
    setN((x) => x + 1);
    setScore((s) => ({ ...s, [out]: s[out] + 1 }));
  };

  // r / p / s, like the original prompt.
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "r" || k === "p" || k === "s") {
      e.preventDefault();
      play(k);
    }
  };

  return (
    <div className="rps" onKeyDown={onKey}>
      <div className="rps-picks" role="group" aria-label="Your choice">
        {MOVES.map((m) => (
          <button key={m.id} type="button" className="pick rps-pick" onClick={() => play(m.id)} aria-keyshortcuts={m.key}>
            <Glyph m={m.id} />
            <span>
              {m.name} <kbd className="mono">{m.key}</kbd>
            </span>
          </button>
        ))}
      </div>

      <div className="rps-face" key={n}>
        {last ? (
          <>
            <div className="rps-side">
              <span className="mono">Your choice</span>
              <Glyph m={last.you} />
              <span>{name(last.you)}</span>
            </div>
            <span className={`rps-out rps-${last.out}`}>{SAY[last.out]}</span>
            <div className="rps-side">
              <span className="mono">System choice</span>
              <Glyph m={last.sys} />
              <span>{name(last.sys)}</span>
            </div>
          </>
        ) : (
          <p className="hands-empty hand">rock, paper or scissor?</p>
        )}
      </div>
      <p className="sr-only" role="status">
        {last ? `You chose ${name(last.you)}, the system chose ${name(last.sys)}. ${SAY[last.out]}.` : ""}
      </p>

      <dl className="rps-tally mono">
        <div>
          <dt>Total matches</dt>
          <dd>{score.you + score.system + score.draw}</dd>
        </div>
        <div>
          <dt>You Won</dt>
          <dd>{score.you}</dd>
        </div>
        <div>
          <dt>System Won</dt>
          <dd>{score.system}</dd>
        </div>
        <div>
          <dt>Match Draw</dt>
          <dd>{score.draw}</dd>
        </div>
      </dl>
    </div>
  );
}

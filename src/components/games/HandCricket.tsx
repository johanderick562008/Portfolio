import { useState, type KeyboardEvent } from "react";

const BALLS = 12; // two overs a side keeps a round under a minute

/** Dice-style pip layouts, so each "hand" reads at a glance. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Pips({ n }: { n: number }) {
  return (
    <span className="pips" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={PIPS[n].includes(i) ? "on" : ""} />
      ))}
    </span>
  );
}

type Phase = "you-bat" | "bot-bat" | "done";
interface Ball {
  you: number;
  bot: number;
  out: boolean;
}

const runs = (bs: Ball[], who: "you" | "bot") => bs.reduce((s, b) => s + (b.out ? 0 : b[who]), 0);

export function HandCricket() {
  const [phase, setPhase] = useState<Phase>("you-bat");
  const [inn1, setInn1] = useState<Ball[]>([]);
  const [inn2, setInn2] = useState<Ball[]>([]);
  const [last, setLast] = useState<Ball | null>(null);

  const yourScore = runs(inn1, "you");
  const botScore = runs(inn2, "bot");
  const target = yourScore + 1;

  const play = (n: number) => {
    if (phase === "done") return;
    const bot = 1 + Math.floor(Math.random() * 6);
    const ball: Ball = { you: n, bot, out: n === bot };
    setLast(ball);
    if (phase === "you-bat") {
      const next = [...inn1, ball];
      setInn1(next);
      if (ball.out || next.length >= BALLS) setPhase("bot-bat");
    } else {
      const next = [...inn2, ball];
      setInn2(next);
      if (ball.out || next.length >= BALLS || runs(next, "bot") >= target) setPhase("done");
    }
  };

  const reset = () => {
    setPhase("you-bat");
    setInn1([]);
    setInn2([]);
    setLast(null);
  };

  // Keys 1–6 play while focus is anywhere inside the game.
  const onKey = (e: KeyboardEvent) => {
    if (/^[1-6]$/.test(e.key) && phase !== "done") {
      e.preventDefault();
      play(Number(e.key));
    }
  };

  let verdict = "";
  if (phase === "done") {
    if (botScore >= target) verdict = "JD-bot chased it down. Rematch?";
    else if (botScore === yourScore) verdict = "A tie. Nobody tell the scorer.";
    else verdict = `You win by ${yourScore - botScore} run${yourScore - botScore === 1 ? "" : "s"}.`;
  }

  const status =
    phase === "you-bat"
      ? "You're batting. Pick a number; if JD-bot picks the same, you're out."
      : phase === "bot-bat"
        ? `You're bowling. JD-bot needs ${Math.max(0, target - botScore)} from ${BALLS - inn2.length} balls. Match its number to take the wicket.`
        : verdict;

  const log = phase === "you-bat" ? inn1 : inn2;

  return (
    <div className="cricket" onKeyDown={onKey}>
      <div className="score">
        <div className={phase === "you-bat" ? "is-batting" : ""}>
          <span className="score-who">You</span>
          <span className="score-num">{yourScore}</span>
          <span className="score-sub mono">
            {inn1.length}/{BALLS} balls{inn1.some((b) => b.out) ? " · out" : ""}
          </span>
        </div>
        <div className={phase === "bot-bat" ? "is-batting" : ""}>
          <span className="score-who">JD-bot</span>
          <span className="score-num">{inn2.length ? botScore : "–"}</span>
          <span className="score-sub mono">{phase === "you-bat" ? "yet to bat" : `target ${target}`}</span>
        </div>
      </div>

      <div className="hands">
        {last ? (
          <>
            <div className="hand-show" key={`y${inn1.length + inn2.length}`}>
              <Pips n={last.you} />
              <span>You · {last.you}</span>
            </div>
            <span className={`hand-vs ${last.out ? "is-out" : ""}`}>{last.out ? "OUT!" : "vs"}</span>
            <div className="hand-show" key={`b${inn1.length + inn2.length}`}>
              <Pips n={last.bot} />
              <span>JD-bot · {last.bot}</span>
            </div>
          </>
        ) : (
          <p className="hands-empty hand">pick a number to face the first ball</p>
        )}
      </div>

      <p className="game-status" role="status">
        {status}
      </p>

      {phase !== "done" ? (
        <div className="picks" role="group" aria-label={phase === "you-bat" ? "Choose your shot" : "Choose your delivery"}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} type="button" className="pick" onClick={() => play(n)} aria-label={`Play ${n}`}>
              <Pips n={n} />
              <span>{n}</span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="btn btn-primary" onClick={reset}>
          Play again
        </button>
      )}

      {log.length > 0 && (
        <ol className="balls" aria-label="This innings, ball by ball">
          {log.map((b, i) => (
            <li key={i} className={b.out ? "w" : ""}>
              {b.out ? "W" : phase === "you-bat" ? b.you : b.bot}
            </li>
          ))}
        </ol>
      )}
      <p className="game-keys mono" aria-hidden="true">
        keys 1–6 work too
      </p>
    </div>
  );
}

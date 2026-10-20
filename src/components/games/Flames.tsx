import { useState, type FormEvent } from "react";
import { FLAMES, flames, type FlamesWorking } from "../../lib/flames";

/** FLAMES with the working shown, the way it's done on the back page of a notebook. */
export function Flames() {
  const [n1, setN1] = useState("Python");
  const [n2, setN2] = useState("JavaScript");
  const [res, setRes] = useState<FlamesWorking | null>(null);
  const [run, setRun] = useState(0);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!n1.trim() || !n2.trim()) {
      setError("Two names, please. That's the whole game.");
      setRes(null);
      return;
    }
    setError("");
    setRes(flames(n1, n2));
    setRun((r) => r + 1);
  };

  return (
    <div className="flames">
      <form className="flames-form" onSubmit={submit} noValidate>
        <label>
          <span className="mono">Name 1</span>
          <input value={n1} onChange={(e) => setN1(e.target.value)} maxLength={30} autoComplete="off" spellCheck={false} />
        </label>
        <span className="flames-amp hand" aria-hidden="true">
          &amp;
        </span>
        <label>
          <span className="mono">Name 2</span>
          <input value={n2} onChange={(e) => setN2(e.target.value)} maxLength={30} autoComplete="off" spellCheck={false} />
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
          Work it out
        </button>
      </form>
      {error && <p className="field-err">{error}</p>}

      {res && (
        <div className="flames-work" key={run} aria-hidden="true">
          {[res.a, res.b].map((letters, k) => (
            <p key={k} className="flames-name">
              {letters.map((l, i) => (
                <span key={i} className={l.struck ? "is-struck" : ""} style={{ ["--d" as string]: `${i * 40}ms` }}>
                  {l.ch}
                </span>
              ))}
            </p>
          ))}
          <p className="flames-count hand">
            {res.count} letter{res.count === 1 ? "" : "s"} left, so count {res.count} round F·L·A·M·E·S
          </p>
          <p className="flames-word">
            {FLAMES.map((w) => {
              const order = res.eliminated.indexOf(w);
              return (
                <span key={w} className={order >= 0 ? "is-out" : "is-result"} style={{ ["--d" as string]: `${700 + order * 260}ms` }}>
                  {w[0]}
                </span>
              );
            })}
          </p>
        </div>
      )}
      <p className="game-status flames-result" role="status">
        {res && (
          <>
            <span className="sr-only">
              {res.count} letters left after crossing out the common ones. Result:{" "}
            </span>
            The relationship is <strong>{res.result}</strong>
            <span className="flames-joke"> · not scientific, please don't act on it</span>
          </>
        )}
      </p>
    </div>
  );
}

import { useId, useMemo, useState } from "react";
import { mathProjects } from "../data/projects";
import { adjugate, add, det, fraction, mul, sub, type Matrix } from "../lib/matrix";
import { MAX_DIGITS, toIndianWords } from "../lib/indianWords";
import { ExtLink, ProjectLinks, StatusTag } from "./Common";

type Op = "A+B" | "A−B" | "A×B" | "det A" | "A⁻¹";
const OPS: Op[] = ["A+B", "A−B", "A×B", "det A", "A⁻¹"];

type Cells = string[][];
const cells = (m: Matrix): Cells => m.map((r) => r.map(String));
const START: Record<number, [Cells, Cells]> = {
  2: [cells([[4, 7], [2, 6]]), cells([[1, 2], [3, 4]])],
  3: [cells([[2, 0, 1], [1, 3, 2], [1, 1, 1]]), cells([[1, 0, 0], [0, 2, 0], [1, 0, 1]])],
};
/** Parses cells; returns null if any cell isn't a whole number. */
function parse(c: Cells): Matrix | null {
  const m = c.map((r) => r.map((v) => (/^-?\d{1,6}$/.test(v.trim()) ? Number(v) : NaN)));
  return m.some((r) => r.some(Number.isNaN)) ? null : m;
}

function MatrixInput({ label, m, onChange }: { label: string; m: Cells; onChange: (m: Cells) => void }) {
  const id = useId();
  return (
    <fieldset className="mx-in">
      <legend className="mono">{label}</legend>
      <div className="mx-bracket" style={{ ["--n" as string]: m.length }}>
        {m.map((row, r) =>
          row.map((v, c) => (
            <input
              key={`${id}-${r}-${c}`}
              inputMode="numeric"
              aria-label={`${label} row ${r + 1} column ${c + 1}`}
              value={v}
              aria-invalid={!/^-?\d{1,6}$/.test(v.trim()) || undefined}
              onChange={(e) => {
                const next = m.map((row2) => [...row2]);
                next[r][c] = e.target.value;
                onChange(next);
              }}
            />
          )),
        )}
      </div>
    </fieldset>
  );
}

function MatrixOut({ m, scale }: { m: string[][]; scale?: string }) {
  return (
    <div className="mx-out-wrap">
      {scale && <span className="mx-scale mono">{scale} ×</span>}
      <div className="mx-bracket mx-out" style={{ ["--n" as string]: m.length }}>
        {m.flat().map((v, i) => (
          <output key={i}>{v}</output>
        ))}
      </div>
    </div>
  );
}

function MatrixDemo() {
  const [n, setN] = useState(2);
  const [ca, setA] = useState<Cells>(START[2][0]);
  const [cb, setB] = useState<Cells>(START[2][1]);
  const [op, setOp] = useState<Op>("A⁻¹");
  const needsB = op === "A+B" || op === "A−B" || op === "A×B";

  const setOrder = (k: number) => {
    setN(k);
    setA(START[k][0]);
    setB(START[k][1]);
  };

  const result = useMemo(() => {
    const a = parse(ca);
    const b = parse(cb);
    if (!a || (needsB && !b)) return { error: "Every cell needs a whole number (up to 6 digits)." };
    const str = (m: Matrix) => m.map((r) => r.map(String));
    switch (op) {
      case "A+B":
        return { m: str(add(a, b!)) };
      case "A−B":
        return { m: str(sub(a, b!)) };
      case "A×B":
        return { m: str(mul(a, b!)) };
      case "det A":
        return { value: String(det(a)) };
      case "A⁻¹": {
        const d = det(a);
        if (d === 0) return { error: "det A = 0, so A has no inverse. The original program checks for this too." };
        const adj = adjugate(a);
        return { m: adj.map((r) => r.map((v) => fraction(v, d))), note: `= (1/${d}) · adj(A)` };
      }
    }
  }, [ca, cb, op, needsB]);

  return (
    <div className="bench-demo">
      <div className="bench-controls">
        <div className="seg" role="group" aria-label="Matrix order">
          {[2, 3].map((k) => (
            <button key={k} type="button" aria-pressed={n === k} onClick={() => setOrder(k)}>
              {k}×{k}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Operation">
          {OPS.map((o) => (
            <button key={o} type="button" aria-pressed={op === o} onClick={() => setOp(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-row">
        <MatrixInput label="A" m={ca} onChange={setA} />
        {needsB && <MatrixInput label="B" m={cb} onChange={setB} />}
        <span className="mx-eq" aria-hidden="true">=</span>
        <div className="mx-result" aria-live="polite">
          {"error" in result && result.error ? (
            <p className="mx-err">{result.error}</p>
          ) : "value" in result ? (
            <p className="mx-det mono">{result.value}</p>
          ) : "m" in result && result.m ? (
            <>
              <MatrixOut m={result.m} />
              {"note" in result && <p className="mono mx-note">{result.note}</p>}
            </>
          ) : null}
        </div>
      </div>
      <p className="bench-foot mono">Browser re-implementation of the program logic · inputs are integers, inverse shown as exact fractions</p>
    </div>
  );
}

function WordsDemo() {
  const [value, setValue] = useState("12345678");
  const r = toIndianWords(value);
  const examples = ["100000", "4500000", "10000000", "987654321012"];
  return (
    <div className="bench-demo">
      <label className="words-label mono" htmlFor="words-in">
        Number (up to {MAX_DIGITS} digits)
      </label>
      <input
        id="words-in"
        className="words-in mono"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby="words-out"
      />
      <div className="words-ex" role="group" aria-label="Examples">
        {examples.map((x) => (
          <button key={x} type="button" className="chip mono" onClick={() => setValue(x)}>
            {x.length > 7 ? `${x.slice(0, 7)}…` : x}
          </button>
        ))}
      </div>
      <div id="words-out" className="words-out" aria-live="polite">
        {r.ok ? (
          <>
            <p className="mono words-grouped">{r.grouped}</p>
            <p className="words-text">{r.words}</p>
          </>
        ) : (
          <p className="mx-err">{r.error}</p>
        )}
      </div>
      <p className="bench-foot mono">Browser re-implementation · Indian grouping 3·2·2 · whole numbers only</p>
    </div>
  );
}

export function Bench() {
  const [matrix, words] = mathProjects;
  return (
    <section className="bench wrap" aria-labelledby="bench-title">
      <header className="bench-intro" data-reveal>
        <p className="kicker mono">
          <span className="kicker-no">03–04</span> Logic-heavy Python, ported so you can poke at it
        </p>
        <h3 id="bench-title" className="sub-title">
          Maths, with the working shown
        </h3>
      </header>
      <div className="bench-grid">
      {[
        { p: matrix, demo: <MatrixDemo />, concept: "Fixed-size matrices, cofactor expansion, the adjugate, and the det = 0 case." },
        { p: words, demo: <WordsDemo />, concept: "Splitting digits into Indian place-value groups, and the crore boundary." },
      ].map(({ p, demo, concept }) => (
        <article key={p.id} className="bench-item" aria-labelledby={`${p.id}-title`} data-reveal>
          <header className="bench-head">
            <span className="mono feat-index">{p.index}</span>
            <div>
              <p className="mono feat-kind">{p.kind}</p>
              <h4 id={`${p.id}-title`} className="bench-title">{p.title}</h4>
            </div>
            <StatusTag status={p.status} />
          </header>
          <p className="bench-sum">{p.summary}</p>
          <p className="bench-concept">
            <span className="mono">Concepts</span> {concept}
          </p>
          {demo}
          <ProjectLinks p={p} />
          {p.id === "matrix" && (
            <div className="p-links p-links-tight">
              <ExtLink href="https://github.com/johanderick562008/Determinant-Inverse">Determinant &amp; inverse program</ExtLink>
            </div>
          )}
        </article>
      ))}
      </div>
    </section>
  );
}


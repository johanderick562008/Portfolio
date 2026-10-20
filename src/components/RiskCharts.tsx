import { useState } from "react";
import { LABELS, MODELS, type ModelId, type ModelResult } from "../data/risk";

/* ----------------------------------------------------- confusion matrix --- */

const WITH_MATRIX = MODELS.filter((m) => m.confusion);

/** Why a cell is where it is, for the models that only look at attendance. */
function explain(m: ModelResult, r: number, c: number, v: number): string {
  const attendanceOnly = m.id === "rule" || m.id === "tree" || m.id === "forest";
  if (m.id === "baseline") return "The baseline calls everyone High, so only the High row is ever right.";
  if (r === c) return `${v} correct. ${["Low", "Medium", "High"][r]} students the model labelled correctly.`;
  if (attendanceOnly) {
    if (r === 1 && c === 0) return "Labelled Medium because their Total_Score was under 65, but their attendance was fine. No allowed feature carries Total_Score, so no model can see why.";
    if (r === 2 && c === 0) return "Labelled High because Total_Score was under 55, with good attendance. These are the 23% of High-risk students that no model on this data can find.";
    if (r === 2 && c === 1) return "Total_Score under 55 made them High; attendance between 65% and 75% made the model say Medium.";
  }
  return `${v} ${LABELS[r]} students predicted ${LABELS[c]}.`;
}

export function ConfusionMatrix() {
  const [id, setId] = useState<ModelId>("tree");
  const [mode, setMode] = useState<"count" | "row">("count");
  const [cell, setCell] = useState<[number, number] | null>([1, 0]);
  const m = WITH_MATRIX.find((x) => x.id === id)!;
  const cm = m.confusion!;
  const rowTotals = cm.map((r) => r.reduce((a, b) => a + b, 0));
  const max = Math.max(...cm.flat());
  const share = (r: number, c: number) => cm[r][c] / rowTotals[r];
  const t = (r: number, c: number) => (mode === "count" ? cm[r][c] / max : share(r, c));
  const fmt = (r: number, c: number) => (mode === "count" ? String(cm[r][c]) : `${Math.round(share(r, c) * 100)}%`);

  return (
    <figure className="cmx" aria-labelledby="cmx-cap">
      <div className="chart-filters">
        <div className="seg" role="group" aria-label="Model">
          {WITH_MATRIX.map((x) => (
            <button key={x.id} type="button" aria-pressed={id === x.id} onClick={() => setId(x.id)}>
              {x.short}
              {x.selected && <span className="sr-only"> (selected model)</span>}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Show">
          <button type="button" aria-pressed={mode === "count"} onClick={() => setMode("count")}>
            Counts
          </button>
          <button type="button" aria-pressed={mode === "row"} onClick={() => setMode("row")}>
            % of true class
          </button>
        </div>
      </div>

      <div className="cmx-body">
        <table className="cmx-table" onMouseLeave={() => setCell(null)}>
          <caption id="cmx-cap" className="chart-cap">
            {m.name}: test set, 1,960 students. Rows are the true label, columns the prediction.
          </caption>
          <thead>
            <tr>
              <td />
              {LABELS.map((l) => (
                <th key={l} scope="col">
                  <span className="cmx-axis mono">predicted</span> {l}
                </th>
              ))}
              <th scope="col" className="cmx-n mono">
                n
              </th>
            </tr>
          </thead>
          <tbody>
            {cm.map((row, r) => (
              <tr key={r}>
                <th scope="row">
                  <span className="cmx-axis mono">true</span> {LABELS[r]}
                </th>
                {row.map((v, c) => {
                  const k = t(r, c);
                  const on = cell?.[0] === r && cell?.[1] === c;
                  return (
                    <td
                      key={c}
                      tabIndex={0}
                      className={`cmx-cell ${r === c ? "is-diag" : ""} ${on ? "is-on" : ""}`}
                      style={{ ["--t" as string]: k }}
                      onMouseEnter={() => setCell([r, c])}
                      onFocus={() => setCell([r, c])}
                      aria-label={`True ${LABELS[r]}, predicted ${LABELS[c]}: ${v} students, ${Math.round(share(r, c) * 100)}% of true ${LABELS[r]}`}
                    >
                      <span className="cmx-v">{fmt(r, c)}</span>
                    </td>
                  );
                })}
                <td className="cmx-n mono">{rowTotals[r]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cmx-scale" aria-hidden="true">
          <span className="mono">0</span>
          <i />
          <span className="mono">{mode === "count" ? max : "100%"}</span>
        </div>
      </div>
      <p className="chart-readout" aria-live="polite">
        {cell ? (
          <>
            <b>
              {cm[cell[0]][cell[1]]} · {Math.round(share(cell[0], cell[1]) * 100)}% of true {LABELS[cell[0]]}
            </b>{" "}
            {explain(m, cell[0], cell[1], cm[cell[0]][cell[1]])}
          </>
        ) : (
          "Hover or focus a cell to read it."
        )}
      </p>
    </figure>
  );
}

/* ----------------------------------------------------------- model bars --- */

type Metric = "f1" | "acc" | "highR" | "highP";
const METRICS: { id: Metric; label: string; why: string }[] = [
  { id: "f1", label: "Macro F1", why: "Precision and recall balanced, every class counted equally." },
  { id: "acc", label: "Accuracy", why: "Share of all students classified correctly. Misleading on its own." },
  { id: "highR", label: "High recall", why: "Of truly High-risk students, how many were flagged. Low = students missed." },
  { id: "highP", label: "High precision", why: "Of students flagged High, how many really were. Low = needless flags." },
];
const f3 = (x: number) => x.toFixed(3);
/** The leakage run is shown to 4 places: 0.9995 would misleadingly print as 0.999 or 1.000. */
const fmt = (m: ModelResult, x: number) => (m.reference ? x.toFixed(4) : f3(x));

export function ModelBars() {
  const [metric, setMetric] = useState<Metric>("f1");
  const [hot, setHot] = useState<ModelId | null>(null);
  const [table, setTable] = useState(false);
  const meta = METRICS.find((x) => x.id === metric)!;
  const focus = MODELS.find((m) => m.id === hot);

  return (
    <figure className="bars" aria-labelledby="bars-cap">
      <div className="chart-filters">
        <div className="seg" role="group" aria-label="Metric">
          {METRICS.map((x) => (
            <button key={x.id} type="button" aria-pressed={metric === x.id} onClick={() => setMetric(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <p className="chart-cap" id="bars-cap">
        {meta.label} on the test set (1,960 students). {meta.why}
      </p>
      <div className="bars-plot" onMouseLeave={() => setHot(null)}>
        <div className="bars-grid" aria-hidden="true">
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <span key={g} style={{ left: `${g * 100}%` }}>
              <i className="mono">{g === 0 || g === 1 ? g : g.toFixed(2)}</i>
            </span>
          ))}
        </div>
        <ul className="bars-list">
          {MODELS.map((m) => {
            const v = m.test[metric];
            return (
              <li
                key={m.id}
                className={`bar-row ${m.selected ? "is-pick" : ""} ${m.reference ? "is-ref" : ""} ${hot === m.id ? "is-on" : ""}`}
                tabIndex={0}
                onMouseEnter={() => setHot(m.id)}
                onFocus={() => setHot(m.id)}
                onBlur={() => setHot(null)}
                aria-label={`${m.name}: ${meta.label} ${fmt(m, v)}${m.selected ? ", selected model" : ""}${m.reference ? ", leakage, reference only" : ""}`}
              >
                <span className="bar-name">
                  {m.name}
                  {m.selected && <span className="bar-tag mono">selected</span>}
                  {m.reference && <span className="bar-tag mono">leakage · excluded</span>}
                </span>
                <span className="bar-track">
                  <span className="bar" style={{ ["--v" as string]: v }} />
                  <span className={`bar-val mono ${v > 0.86 ? "is-inside" : ""}`} style={{ ["--v" as string]: v }}>
                    {fmt(m, v)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="chart-readout" aria-live="polite">
        {focus ? (
          <>
            <b>
              {focus.name} · {fmt(focus, focus.test[metric])}
            </b>{" "}
            {focus.cv ? `Cross-validated on the training set: ${f3(focus.cv[metric])}. ` : ""}
            {focus.why}
          </>
        ) : (
          "Hover or focus a bar for the cross-validation score and what the approach is."
        )}
      </p>
      <button type="button" className="link-btn pen" aria-expanded={table} aria-controls="bars-table" onClick={() => setTable((x) => !x)}>
        {table ? "Hide" : "Show"} the full table
      </button>
      <div id="bars-table" hidden={!table} className="table-scroll">
        <table className="results">
          <caption className="sr-only">Test-set results for every approach</caption>
          <thead>
            <tr>
              <th scope="col">Approach</th>
              <th scope="col" className="num">
                Accuracy
              </th>
              <th scope="col" className="num">
                Macro F1
              </th>
              <th scope="col" className="num">
                High precision
              </th>
              <th scope="col" className="num">
                High recall
              </th>
              <th scope="col" className="num">
                CV macro F1
              </th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.id} className={m.selected ? "is-pick" : m.reference ? "is-ref" : ""}>
                <th scope="row">
                  {m.name}
                  {m.selected && <span className="row-note mono">selected</span>}
                  {m.reference && <span className="row-note mono">leakage · reference only</span>}
                </th>
                <td className="num mono">{fmt(m, m.test.acc)}</td>
                <td className="num mono">{fmt(m, m.test.f1)}</td>
                <td className="num mono">{fmt(m, m.test.highP)}</td>
                <td className="num mono">{fmt(m, m.test.highR)}</td>
                <td className="num mono">{m.cv ? f3(m.cv.f1) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

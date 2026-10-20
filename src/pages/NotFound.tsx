import { useEffect, useState } from "react";
import { Hand } from "../components/Ink";
import { TIMETABLE } from "../data/timetable";
import { Link } from "../router";

/** The 404: prerendered to dist/404.html, so static hosts serve it with a real 404 status. */
export default function NotFound() {
  // The path is only known in the browser (the prerendered page is shared by every bad URL).
  const [path, setPath] = useState("");
  useEffect(() => setPath(window.location.pathname), []);

  return (
    <section className="lost wrap" aria-labelledby="lost-title">
      <p className="lost-code mono" aria-hidden="true">
        404 · absent
      </p>
      <h1 id="lost-title" className="lost-title" tabIndex={-1}>
        You've bunked into a page that doesn't exist.
      </h1>
      <p className="lost-body">
        {path ? (
          <>
            There's no <code className="mono">{path}</code> on today's timetable.
          </>
        ) : (
          <>That page isn't on today's timetable.</>
        )}{" "}
        Nobody's marking the register, so head back before anyone notices.
      </p>
      <div className="lost-ctas">
        <Link to="/" className="btn btn-primary">
          Back to class
        </Link>
        <Link to="/work/freeboard" className="pen link-quiet">
          or read the FreeBoard case study <span aria-hidden="true">→</span>
        </Link>
      </div>
      <figure className="lost-tt" aria-hidden="true">
        <ol>
          {TIMETABLE.map((p) => (
            <li key={p.id} className={`lost-cell lost-${p.kind}`}>
              <span className="mono">{p.period}</span>
              <span>{p.label}</span>
            </li>
          ))}
          <li className="lost-cell lost-you">
            <span className="mono">??</span>
            <span>You, apparently</span>
          </li>
        </ol>
        <Hand className="lost-note">not on the timetable</Hand>
      </figure>
    </section>
  );
}

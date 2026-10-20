import { FEATURES, LIVE_URL, SHOTS } from "../data/freeboard";
import { featured } from "../data/projects";
import { usePing } from "../hooks/hooks";
import { Link } from "../router";
import { ExtLink, Shot, Stack } from "./Common";
import { Arrow, Hand } from "./Ink";

/** The FreeBoard ping that used to live in the hero: a real request from the visitor's browser. */
function PingPill() {
  const ping = usePing(LIVE_URL);
  return (
    <p className={`ping ping-${ping.k}`} role="status">
      <span className="ping-dot" aria-hidden="true" />
      {ping.k === "checking" && <>Checking it's up…</>}
      {ping.k === "up" && (
        <>
          Live · your browser reached it in <b className="mono">{ping.ms} ms</b>
        </>
      )}
      {ping.k === "down" && <>Couldn't reach it from here just now</>}
    </p>
  );
}

/** FreeBoard on the home page: a product launch, not a card. */
export function FreeBoardLaunch() {
  const p = featured.freeboard;
  return (
    <article className="launch" aria-labelledby="fb-title">
      <div className="launch-inner wrap">
        <div className="launch-top">
          <p className="launch-kicker mono">
            <span className="launch-no">01</span> Flagship · live since {p.published}
          </p>
          <div className="launch-ping">
            <PingPill />
            <Hand className="launch-ping-note">a real ping, sent just now</Hand>
          </div>
        </div>

        <div className="launch-grid">
          <div className="launch-copy">
            <h3 id="fb-title" className="launch-name">
              FreeBoard
            </h3>
            <p className="launch-tag">
              See who's free, <em>right now.</em>
            </p>
            <p className="launch-lede">
              Between periods, someone always asks "who's free?" and checks timetables by hand. With FreeBoard you save your timetable once,
              connect with classmates, and it tells you who's free this period.
            </p>
            <div className="launch-ctas">
              <a href={LIVE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-paper">
                Open the app <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <Link to="/work/freeboard" className="btn btn-line">
                Read the case study <span aria-hidden="true">→</span>
              </Link>
            </div>
            {p.repo && (
              <p className="launch-src">
                <ExtLink href={p.repo}>Source on GitHub</ExtLink>
              </p>
            )}
          </div>

          <div className="launch-stage">
            <figure className="launch-desk">
              <div className="frame" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="mono">freeboard-phi.vercel.app/app.html</span>
              </div>
              <Shot s={SHOTS.live} sizes="(min-width: 1100px) 720px, 92vw" />
              <figcaption className="sr-only">{SHOTS.live.caption}</figcaption>
            </figure>
            <figure className="launch-phone">
              <Shot s={SHOTS.mobile} sizes="(min-width: 1100px) 200px, 34vw" />
              <figcaption className="sr-only">{SHOTS.mobile.caption}</figcaption>
            </figure>
            <Hand className="launch-note">
              <Arrow dir="up-left" />
              the real app; the people are sample data
            </Hand>
          </div>
        </div>

        <ol className="launch-features" aria-label="What FreeBoard does">
          {FEATURES.map((f, i) => (
            <li key={f.t} data-reveal style={{ ["--i" as string]: i }}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <strong>{f.t}</strong>
              <span>{f.d}</span>
            </li>
          ))}
        </ol>
        <Stack items={p.stack} />
      </div>
    </article>
  );
}

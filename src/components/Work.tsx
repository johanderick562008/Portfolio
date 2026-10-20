import { RULE, TREE_RULES } from "../data/risk";
import { Deferred, noLoad } from "../deferred";
import { PROJECT_COUNT, featured } from "../data/projects";
import { ProjectLinks, SectionHead, StatusTag } from "./Common";
import { FreeBoardLaunch } from "./FreeBoardLaunch";
import { Arrow, Hand, Mark } from "./Ink";

function RiskTeaser() {
  const p = featured.risk;
  return (
    <article className="teaser wrap" aria-labelledby="risk-title">
      <div className="teaser-copy" data-reveal>
        <p className="kicker mono">
          <span className="kicker-no">02</span> Machine learning · {p.published}
        </p>
        <h3 id="risk-title" className="teaser-title">
          Student Academic Risk Predictor
        </h3>
        <p className="teaser-hook">
          The best model scored 0.807. Then I looked at what it had learned: <Mark>my own labelling rule</Mark>, rediscovered.
        </p>
        <ul className="ticks">
          <li>A 10,030-row Kaggle dataset, cleaned and anonymised</li>
          <li>A baseline, logistic regression, a decision tree and a random forest, compared on the same split</li>
          <li>A perfect training score (1.000) that turned out to be leakage, and was excluded</li>
          <li>A Streamlit dashboard, and pytest</li>
        </ul>
        <StatusTag status={p.status} />
        <ProjectLinks p={p} />
      </div>

      <figure className="rules" data-reveal aria-labelledby="rules-cap">
        <div className="rules-col">
          <p className="rules-h hand">the rule I wrote</p>
          <dl className="rules-rule">
            {RULE.map((r) => (
              <div key={r.level}>
                <dt>{r.level}</dt>
                <dd className="mono">{r.cond}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rules-eq" aria-hidden="true">
          <Hand>same thresholds</Hand>
          <Arrow dir="right" />
        </div>
        <div className="rules-col">
          <p className="rules-h hand">what the tree learned</p>
          <pre className="code rules-code">
            <code>{TREE_RULES}</code>
          </pre>
        </div>
        <figcaption id="rules-cap" className="rules-cap">
          The selected tree agrees with the attendance-only rule on 100% of the 1,960 test students. On this data, ML doesn't beat the
          rule. It rediscovers it.
        </figcaption>
      </figure>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          id="work"
          layout="inline"
          title="Things I've built"
          aside="(the good stuff first)"
          kicker={`${PROJECT_COUNT} projects, all public on GitHub. Status stated plainly: live, runs locally, or command-line.`}
        />
      </div>
      <FreeBoardLaunch />
      <RiskTeaser />
      <Deferred name="bench" load={import.meta.env.SSR ? noLoad : () => import("./Bench").then((m) => m.Bench)} />
      <Deferred name="index" load={import.meta.env.SSR ? noLoad : () => import("./WorkIndex").then((m) => m.WorkIndex)} />
    </section>
  );
}

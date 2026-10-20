import { CaseHeader, CaseSection, LessonPlan, NextCase } from "../components/CaseParts";
import { ExtLink, Stack, StatusTag } from "../components/Common";
import { Arrow, Hand, Mark } from "../components/Ink";
import { ConfusionMatrix, ModelBars } from "../components/RiskCharts";
import { featured } from "../data/projects";
import { DATA_FACTS, EXCLUDED, FEATURES_USED, POLICY, QUIRKS, REPO, RULE, TREE_RULES } from "../data/risk";

const PLAN = [
  { id: "question", label: "The question" },
  { id: "data", label: "The data" },
  { id: "labels", label: "The labels" },
  { id: "leak", label: "The perfect score" },
  { id: "models", label: "Models compared" },
  { id: "errors", label: "Where it goes wrong" },
  { id: "learned", label: "What it learned" },
  { id: "care", label: "Care & limits" },
  { id: "shipped", label: "Dashboard & tests" },
];

export default function RiskCase() {
  const p = featured.risk;
  return (
    <article className="case case-risk">
      <CaseHeader
        crumb="Risk Predictor"
        title={
          <>
            Student Academic Risk Predictor <em>case study</em>
          </>
        }
        lede={
          <>
            The model scored 0.807. Then I looked at what it had learned, and it was <Mark>the rule I'd used to make the labels.</Mark> This is
            the honest version of that project.
          </>
        }
        meta={[
          { k: "Status", v: <StatusTag status={p.status} /> },
          { k: "Finished", v: p.published },
          { k: "Data", v: "10,030-row public Kaggle dataset" },
          { k: "Links", v: <ExtLink href={REPO}>Source on GitHub</ExtLink> },
        ]}
      >
        <Stack items={p.stack} />
      </CaseHeader>

      <div className="case-body wrap">
        <LessonPlan items={PLAN} />
        <div className="case-main">
          <CaseSection id="question" n={1} title="The question">
            <p className="cs-lead">Given a student's attendance and marks so far, can a model flag who might need support before the final exam?</p>
            <p>
              The brief asked for Low, Medium and High risk levels, three classifiers to compare, recommendations, and a report. The data
              has no column saying who actually struggled, so the first real decision was how to define risk at all.
            </p>
          </CaseSection>

          <CaseSection id="data" n={2} title="The data">
            <dl className="tiles">
              {DATA_FACTS.map((f) => (
                <div key={f.k} className="tile" data-reveal>
                  <dt>{f.v}</dt>
                  <dd>{f.k}</dd>
                </div>
              ))}
            </dl>
            <p>Exploring it first turned up more than missing values:</p>
            <ul className="ticks">
              {QUIRKS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
            <Hand className="aside-note" as="p">
              the columns look like they were generated independently of each other. that matters later
            </Hand>
          </CaseSection>

          <CaseSection id="labels" n={3} title="The labels">
            <p>
              Risk is defined by a transparent rule, checked in order, so a student who meets a High condition can never be labelled Medium.
              These are <strong>proxy labels</strong>: a policy I chose, not observed outcomes like failing a course.
            </p>
            <dl className="rule-card">
              {RULE.map((r) => (
                <div key={r.level} className={`rule-${r.level.toLowerCase()}`}>
                  <dt>{r.level}</dt>
                  <dd className="mono">{r.cond}</dd>
                </div>
              ))}
            </dl>
            <p>
              One change from the brief: it suggested Total_Score &lt; 50 for High. The lowest Total_Score in the file is 50.02, so that
              condition matched nobody and High would quietly become attendance-only. I raised it to 55:
            </p>
            <div className="table-scroll">
              <table className="results policy">
                <caption className="sr-only">Label counts under each threshold</caption>
                <thead>
                  <tr>
                    <th scope="col">Policy</th>
                    <th scope="col" className="num">
                      Low
                    </th>
                    <th scope="col" className="num">
                      Medium
                    </th>
                    <th scope="col" className="num">
                      High
                    </th>
                    <th scope="col">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {POLICY.map((r, i) => (
                    <tr key={r.name} className={i === 1 ? "is-pick" : ""}>
                      <th scope="row">{r.name}</th>
                      <td className="num mono">{r.low}</td>
                      <td className="num mono">{r.med}</td>
                      <td className="num mono">{r.high}</td>
                      <td>{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CaseSection>

          <CaseSection id="leak" n={4} title="The perfect score">
            <div className="leak">
              <p className="leak-num" aria-hidden="true">
                <span>1.000</span>
                <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="leak-strike" data-ink>
                  <path d="M6 44 C 60 30, 120 26, 194 12" pathLength={1} />
                </svg>
              </p>
              <div>
                <p className="cs-lead">
                  A random forest given Total_Score scored 1.000 on training and 0.9995 on test. That isn't a great model. It's a model reading
                  the answer.
                </p>
                <p>
                  The labels were built from Total_Score, so including it is leakage. The final models exclude it, along with Grade (derived
                  from the result) and Final_Score (not known before the final). The leaked run stays in the report only as a warning.
                </p>
              </div>
            </div>
            <p className="mono feature-line">
              Features used: {FEATURES_USED.join(" · ")}
            </p>
          </CaseSection>

          <CaseSection id="models" n={5} title="Models compared" wide>
            <p className="cs-intro">
              Same 80/20 stratified split, same preprocessing fitted on training data only. The model was chosen by 5-fold cross-validation on
              the training set: keep models within 0.03 of the best High-risk recall, then take the best macro F1.
            </p>
            <ModelBars />
            <p>
              Logistic regression had the best cross-validated High recall (0.834 against 0.812), but only by flagging extra students almost
              at random: its macro F1 drops to 0.69. The tolerance rule stops a small recall gain from costing that much. The decision tree
              won, tied with the forest and simpler to read.
            </p>
          </CaseSection>

          <CaseSection id="errors" n={6} title="Where it goes wrong" wide>
            <p className="cs-intro">Every mistake is in the lower-left: real risk, predicted too low. Switch models and read the cells.</p>
            <ConfusionMatrix />
          </CaseSection>

          <CaseSection id="learned" n={7} title="What it learned">
            <div className="rules rules-case">
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
            </div>
            <p>
              That is exactly the attendance half of my rule. The tree agrees with the attendance-only rule on 100% of test students, and
              attendance carries 99.6% of its feature importance. The 23% of High-risk students it misses are those with good attendance but a
              Total_Score under 55, and nothing the model is allowed to see carries any information about Total_Score.
            </p>
            <p className="cs-lead">
              So on this dataset, ML doesn't beat the transparent rule. It rediscovers it. The value is a reproducible, tested pipeline that
              could learn real patterns from data where marks and engagement are actually related.
            </p>
          </CaseSection>

          <CaseSection id="care" n={8} title="Care & limits">
            <div className="table-scroll">
              <table className="results excluded">
                <caption className="sr-only">Columns excluded from the model, and why</caption>
                <thead>
                  <tr>
                    <th scope="col">Left out</th>
                    <th scope="col">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {EXCLUDED.map((e) => (
                    <tr key={e.col}>
                      <th scope="row">{e.col}</th>
                      <td>{e.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="ticks">
              <li>The output is a support indicator, never a judgement of a student. The README says so in its first lines.</li>
              <li>"Confidence" is the model's probability for its label, not a probability of failing.</li>
              <li>Recommendations are rule-based and supportive: attendance first if it's low, a mentor for High risk, practice in the weakest areas.</li>
              <li>1,141 rows with a missing input are listed separately rather than predicted from guessed values.</li>
            </ul>
          </CaseSection>

          <CaseSection id="shipped" n={9} title="Dashboard & tests">
            <p>
              A Streamlit dashboard with five tabs: an overview, data insights, model performance (with the learned rules and their limits), a
              form to predict one student, and bulk analysis with a downloadable CSV report that uses anonymous IDs only.
            </p>
            <p>
              27 pytest tests run on small hand-made records, so they need neither the dataset nor a trained model: the rule's boundaries and
              its High-before-Medium order, cleaning, invalid input, a missing model file, and the report's columns. Everything uses{" "}
              <code className="mono">random_state = 42</code>, so the numbers on this page reproduce.
            </p>
          </CaseSection>
        </div>
      </div>
      <NextCase to="/work/freeboard" label="Other case study" title="FreeBoard" />
    </article>
  );
}

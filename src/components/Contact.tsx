import { useState } from "react";
import { site } from "../config/site";
import { TIMETABLE } from "../data/timetable";
import { Link } from "../router";
import { ExtLink, SectionHead } from "./Common";
import { Hand, Wonky } from "./Ink";
import { Monogram } from "./Nav";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;
type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 80, email: 254, message: 2000 };

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  else if (v.name.length > LIMITS.name) e.name = `Keep it under ${LIMITS.name} characters.`;
  if (!EMAIL_RE.test(v.email.trim())) e.email = "That email address doesn't look complete.";
  if (v.message.trim().length < 10) e.message = "A little more detail, please (10+ characters).";
  else if (v.message.length > LIMITS.message) e.message = `Keep it under ${LIMITS.message} characters.`;
  return e;
}

function ContactForm() {
  const endpoint = site.contact.endpoint;
  const email = site.links.email;
  const mode: "post" | "mailto" | "off" = endpoint ? "post" : email ? "mailto" : "off";

  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>({ kind: "idle" });

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    if (errors[f]) setErrors((x) => ({ ...x, [f]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    const first = (Object.keys(errs) as Field[])[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    if (mode === "mailto" && email) {
      const subject = encodeURIComponent(`Portfolio message from ${values.name.trim()}`);
      const body = encodeURIComponent(`${values.message.trim()}\n\nFrom ${values.name.trim()} (${values.email.trim()})`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      setState({ kind: "sent" });
      return;
    }
    if (mode !== "post" || !endpoint) return;
    setState({ kind: "sending" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: hp }),
      });
      if (res.status === 429) throw new Error("Too many messages from this connection. Please try again in a few minutes.");
      if (!res.ok) throw new Error("The message couldn't be delivered. Please try again, or use the links on the left.");
      setState({ kind: "sent" });
      setValues({ name: "", email: "", message: "" });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof TypeError ? "Couldn't reach the server. Check your connection and try again." : (err as Error).message,
      });
    }
  };

  if (mode === "off") {
    return (
      <div className="form-off">
        <p className="mono">Contact form · not configured</p>
        <p>
          The form isn't connected yet. For now, reach me on LinkedIn or GitHub.
        </p>
        {import.meta.env.DEV && (
          <p className="dev-hint mono">
            dev: set <code>links.email</code> in src/config/site.ts, or <code>VITE_CONTACT_ENDPOINT</code>, to enable this form.
          </p>
        )}
      </div>
    );
  }

  if (state.kind === "sent") {
    return (
      <div className="form-done" role="status">
        <p className="mono">{mode === "mailto" ? "Draft opened" : "Message sent"}</p>
        <p>
          {mode === "mailto"
            ? "Your mail app should have opened with the message filled in. Send it from there."
            : "Thanks. I’ll reply to the address you gave."}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => setState({ kind: "idle" })}>
          Write another
        </button>
      </div>
    );
  }

  const sending = state.kind === "sending";
  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-describedby="form-note">
      {(["name", "email"] as const).map((f) => (
        <div className="field" key={f}>
          <label htmlFor={`c-${f}`} className="mono">
            {f === "name" ? "Your name" : "Email to reply to"}
          </label>
          <input
            id={`c-${f}`}
            type={f === "email" ? "email" : "text"}
            autoComplete={f}
            maxLength={LIMITS[f]}
            value={values[f]}
            onChange={set(f)}
            aria-invalid={!!errors[f] || undefined}
            aria-describedby={errors[f] ? `c-${f}-err` : undefined}
            disabled={sending}
          />
          {errors[f] && <p id={`c-${f}-err`} className="field-err">{errors[f]}</p>}
        </div>
      ))}
      <div className="field">
        <label htmlFor="c-message" className="mono">
          Message <span className="count">{values.message.length}/{LIMITS.message}</span>
        </label>
        <textarea
          id="c-message"
          rows={5}
          maxLength={LIMITS.message}
          value={values.message}
          onChange={set("message")}
          aria-invalid={!!errors.message || undefined}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          disabled={sending}
        />
        {errors.message && <p id="c-message-err" className="field-err">{errors.message}</p>}
      </div>
      {/* Honeypot: hidden from people, filled by naive bots; the server drops these. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      {state.kind === "error" && (
        <p className="form-err" role="alert">
          {state.message}
        </p>
      )}
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending}>
          {sending ? "Sending…" : mode === "mailto" ? "Open in your mail app" : "Send message"}
        </button>
        <p id="form-note" className="mono form-note">
          {mode === "mailto" ? "Opens your own email client; nothing is stored here." : "Only used to reply to you. Not stored beyond delivery."}
        </p>
      </div>
    </form>
  );
}

export function Contact() {
  const links = [
    { label: "GitHub", value: site.links.github.replace("https://", ""), href: site.links.github },
    site.links.linkedin && { label: "LinkedIn", value: site.links.linkedin.replace(/https:\/\/(www\.)?/, ""), href: site.links.linkedin },
    site.links.email && { label: "Email", value: site.links.email, href: `mailto:${site.links.email}` },
    site.links.resume && { label: "Résumé", value: "PDF", href: site.links.resume },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section id="contact" className="section contact-sec wrap" aria-labelledby="contact-title">
      <SectionHead
        id="contact"
        layout="center"
        title="Free period."
        aside="(my favourite kind)"
        kicker="Let's talk about software, internships, open source, or a bug you're stuck on."
      />
      <div className="contact" data-reveal>
        <div className="contact-side">
          <p className="contact-lead">
            I'm looking for internships, open-source work, and conversations with developers who've been doing this longer than I have.
          </p>
          <ul className="contact-links">
            {links.map((l) => (
              <li key={l.label}>
                <span className="contact-k mono">{l.label}</span>
                {l.href.startsWith("mailto:") ? (
                  <a href={l.href} className="ext pen">
                    {l.value}
                  </a>
                ) : (
                  <ExtLink href={l.href}>{l.value}</ExtLink>
                )}
              </li>
            ))}
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

/** Easter egg: a stamp that draws itself in the margin once you've attended every period. */
function Attendance({ full }: { full: boolean }) {
  if (!full) return null;
  return (
    <div className="attendance" role="status">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="attendance-stamp">
        <path className="as-ring" d="M60 8 C 30 7, 8 30, 9 60 C 10 90, 32 112, 62 111 C 92 110, 112 88, 111 58 C 110 30, 88 9, 57 10" pathLength={1} />
        <path className="as-tick" d="M38 62 L 53 77 L 84 42" pathLength={1} />
      </svg>
      <Hand className="attendance-note">full attendance. you sat through every period</Hand>
    </div>
  );
}

export function Footer({ fullAttendance = false }: { fullAttendance?: boolean }) {
  return (
    <footer className="footer">
      <div className="wrap footer-bell">
        <p className="hand">that's the bell. thanks for staying till the end.</p>
        <Attendance full={fullAttendance} />
        <p className="footer-word" aria-hidden="true">
          <Wonky text="Johan Derick" />
        </p>
      </div>
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <Monogram size={36} />
          <p>
            <strong>JD</strong>
            <span>Learning by building. One finished project at a time.</span>
          </p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {TIMETABLE.map((s) => (
              <li key={s.id}>
                <Link to={`/#${s.id}`} className="pen">
                  {s.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/work/freeboard" className="pen">
                FreeBoard case study
              </Link>
            </li>
            <li>
              <Link to="/work/risk-predictor" className="pen">
                Risk Predictor case study
              </Link>
            </li>
          </ul>
        </nav>
        <p className="mono footer-meta">
          © {__BUILD_YEAR__} {site.name} · Set in Fraunces, IBM Plex &amp; Kalam · No trackers · Prints as a one-page résumé
        </p>
      </div>
    </footer>
  );
}

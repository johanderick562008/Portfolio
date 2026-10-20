/**
 * Central personal settings.
 *
 * Every value here is something only Johan can confirm. Anything set to `null`
 * is hidden from the page (never replaced with a guess). Fill these in, rebuild,
 * and the matching link / button appears.
 */

export interface SiteConfig {
  name: string;
  monogram: string;
  role: string;
  tagline: string;
  intro: string;
  focusLabels: string[];
  /** Short, accurate line shown under the hero. Set to null to hide it. */
  currentFocus: string | null;
  location: string | null;
  links: {
    github: string;
    /** Full profile URL, e.g. https://www.linkedin.com/in/your-handle */
    linkedin: string | null;
    /** Public contact email. Used for the mailto link and the form fallback. */
    email: string | null;
    /** Optional resume PDF placed in /public, e.g. "/resume.pdf" */
    resume: string | null;
  };
  contact: {
    /**
     * POST endpoint for the contact form (see /server for a FastAPI one).
     * Read from VITE_CONTACT_ENDPOINT at build time. When empty, the form
     * falls back to opening the visitor's mail app (if `links.email` is set),
     * or is shown as unavailable.
     */
    endpoint: string | null;
  };
}

export const site: SiteConfig = {
  name: "Johan Derick",
  monogram: "JD",
  role: "Software Developer in the Making.",
  tagline: "Building useful software, exploring ideas, and turning problems into working products.",
  intro:
    "I build practical software with Python, design backend systems, and turn ideas into products that people can actually use.",
  focusLabels: ["Python & Backend Development", "Full-Stack Projects", "Exploring Machine Learning"],
  currentFocus: "First-year B.Tech · currently going deeper into backend engineering, DSA and ML fundamentals",
  location: null,
  links: {
    github: "https://github.com/johanderick562008",
    linkedin: "https://www.linkedin.com/in/johanderick05062008",
    email: null,
    resume: null,
  },
  contact: {
    endpoint: import.meta.env.VITE_CONTACT_ENDPOINT || null,
  },
};

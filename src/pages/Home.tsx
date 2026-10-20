import { Contact } from "../components/Contact";
import { Hero } from "../components/Hero";
import { Work } from "../components/Work";
import { Deferred, noLoad } from "../deferred";


/** The school day, in timetable order: P1, P2, Recess, P3, P4, P5, Free.
 *  Everything below Work hydrates section by section (see deferred.ts). */
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Deferred name="about" load={import.meta.env.SSR ? noLoad : () => import("../components/Sections").then((m) => m.About)} />
      <Deferred name="recess" load={import.meta.env.SSR ? noLoad : () => import("../components/Recess").then((m) => m.Recess)} />
      <Deferred name="skills" load={import.meta.env.SSR ? noLoad : () => import("../components/Sections").then((m) => m.Skills)} />
      <Deferred name="notes" load={import.meta.env.SSR ? noLoad : () => import("../components/Sections").then((m) => m.Notes)} />
      <Deferred name="journey" load={import.meta.env.SSR ? noLoad : () => import("../components/Sections").then((m) => m.Journey)} />
      <Contact />
    </>
  );
}

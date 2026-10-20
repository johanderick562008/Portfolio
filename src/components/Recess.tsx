import type { ReactNode } from "react";
import { games } from "../data/projects";
import { ExtLink, SectionHead } from "./Common";
import { Flames } from "./games/Flames";
import { HandCricket } from "./games/HandCricket";
import { RockPaperScissors } from "./games/RockPaperScissors";
import { TicTacToe } from "./games/TicTacToe";
import { Hand } from "./Ink";

function Game({
  id,
  title,
  from,
  note,
  repoId,
  className = "",
  children,
}: {
  id: string;
  title: string;
  from: string;
  note: string;
  repoId: string;
  className?: string;
  children: ReactNode;
}) {
  const p = games.find((g) => g.id === repoId);
  return (
    <article className={`game ${className}`} aria-labelledby={`${id}-title`} data-reveal>
      <header className="game-head">
        <p className="game-tag mono">Browser port · {from}</p>
        <h3 id={`${id}-title`} className="game-title">
          {title}
        </h3>
        <Hand className="game-note">{note}</Hand>
      </header>
      {children}
      {p?.repo && (
        <p className="game-src">
          The original: <ExtLink href={p.repo}>{p.repo.replace("https://github.com/johanderick562008/", "")}</ExtLink>
          {p.live[0] && (
            <>
              {" "}
              · <ExtLink href={p.live[0].href}>play the web version</ExtLink>
            </>
          )}
        </p>
      )}
    </article>
  );
}

/** The back pages of the notebook: four games I first wrote while learning Python. */
export function Recess() {
  return (
    <section id="recess" className="recess" aria-labelledby="recess-title">
      <div className="wrap">
        <SectionHead
          id="recess"
          layout="center"
          title="Recess."
          aside="(fifteen minutes, then back to class)"
          kicker="The back pages of the notebook. Games I first wrote while learning Python and JavaScript, ported here so you can play them. Each one links to the real repo."
        />
        <div className="games">
          <Game id="cricket" title="Hand Cricket" from="Python, terminal" note="every Indian kid's first game engine" repoId="hand-cricket" className="game-cricket">
            <HandCricket />
          </Game>
          <Game id="ttt" title="Tic Tac Toe" from="my web version" note="Hard has opening tricks, not perfect play" repoId="ttt-web" className="game-ttt">
            <TicTacToe />
          </Game>
          <Game id="flames" title="FLAMES" from="Python, terminal" note="cross out the common letters, count, repeat" repoId="flames" className="game-flames">
            <Flames />
          </Game>
          <Game id="rps" title="Rock Paper Scissors" from="Python, terminal" note="the original spells it 'Scissor'. so does this" repoId="rps" className="game-rps">
            <RockPaperScissors />
          </Game>
        </div>
      </div>
    </section>
  );
}

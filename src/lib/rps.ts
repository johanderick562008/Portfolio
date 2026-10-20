/**
 * Port of johanderick562008/Rock-Paper-Scissors. The original decides the
 * winner with a lookup: if [you, system] is one of these pairs, the system won.
 */

export type Move = "r" | "p" | "s";
export const MOVES: { id: Move; name: string; key: string }[] = [
  { id: "r", name: "Rock", key: "r" },
  { id: "p", name: "Paper", key: "p" },
  { id: "s", name: "Scissor", key: "s" },
];

const SYSTEM_WINS: [Move, Move][] = [
  ["r", "p"],
  ["p", "s"],
  ["s", "r"],
];

export type Outcome = "draw" | "you" | "system";

export function decide(you: Move, system: Move): Outcome {
  if (you === system) return "draw";
  return SYSTEM_WINS.some(([y, x]) => y === you && x === system) ? "system" : "you";
}

export const randomMove = (): Move => MOVES[Math.floor(Math.random() * 3)].id;

/**
 * Port of johanderick562008/FLAMES (Flames.py), step for step, with the
 * intermediate states kept so the page can show the working like you would
 * on the back of a notebook.
 */

export const FLAMES = ["Friend", "Love", "Affection", "Marriage", "Enemy", "Sister"] as const;
export type Result = (typeof FLAMES)[number];

export interface Letter {
  ch: string;
  struck: boolean;
}

export interface FlamesWorking {
  a: Letter[];
  b: Letter[];
  /** Letters left after crossing out common ones (the Python's `z`). */
  count: number;
  /** The word crossed out at each round, in order. */
  eliminated: Result[];
  result: Result;
}

/** Same normalisation as the Python: lower-case, spaces removed. */
const prep = (s: string) => [...s.toLowerCase().replace(/ /g, "")];

export function flames(name1: string, name2: string): FlamesWorking {
  const x = prep(name1);
  const y = prep(name2);
  const a = x.map((ch) => ({ ch, struck: false }));
  const b = y.map((ch) => ({ ch, struck: false }));

  // for i in x[:]: for j in y: if i == j: x.remove(i); y.remove(j); break
  for (const ai of a) {
    const bj = b.find((l) => !l.struck && l.ch === ai.ch);
    if (bj) {
      ai.struck = true;
      bj.struck = true;
    }
  }
  const count = a.filter((l) => !l.struck).length + b.filter((l) => !l.struck).length;

  // i = 6; while i > 1: j = z; while j - i > 0: j -= i; a = a[j:] + a[:j]; a.pop(); i -= 1
  let list: Result[] = [...FLAMES];
  const eliminated: Result[] = [];
  for (let i = 6; i > 1; i--) {
    let j = count;
    while (j - i > 0) j -= i;
    list = [...list.slice(j), ...list.slice(0, j)];
    eliminated.push(list.pop()!);
  }
  return { a, b, count, eliminated, result: list[0] };
}

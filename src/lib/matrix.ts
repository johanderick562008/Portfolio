/** Small exact matrix helpers for the 2×2 / 3×3 demo (integers in, fractions out). */

export type Matrix = number[][];

export function identityLike(n: number, fill: (r: number, c: number) => number): Matrix {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => fill(r, c)));
}

export const add = (a: Matrix, b: Matrix) => a.map((row, r) => row.map((v, c) => v + b[r][c]));
export const sub = (a: Matrix, b: Matrix) => a.map((row, r) => row.map((v, c) => v - b[r][c]));
export const mul = (a: Matrix, b: Matrix) =>
  a.map((row) => row.map((_, c) => row.reduce((s, v, k) => s + v * b[k][c], 0)));

function minor(m: Matrix, r: number, c: number): Matrix {
  return m.filter((_, i) => i !== r).map((row) => row.filter((_, j) => j !== c));
}

export function det(m: Matrix): number {
  if (m.length === 1) return m[0][0];
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  // Cofactor expansion along the first row, as in the Python program.
  return m[0].reduce((s, v, c) => s + (c % 2 ? -1 : 1) * v * det(minor(m, 0, c)), 0);
}

/** Adjugate (transpose of the cofactor matrix). inverse = adj / det. */
export function adjugate(m: Matrix): Matrix {
  const n = m.length;
  if (n === 2) return [[m[1][1], -m[0][1]], [-m[1][0], m[0][0]]];
  return identityLike(n, (r, c) => ((r + c) % 2 ? -1 : 1) * det(minor(m, c, r)));
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Renders p/q in lowest terms, e.g. (4, -6) -> "−2/3". */
export function fraction(p: number, q: number): string {
  if (p === 0) return "0";
  const g = gcd(p, q);
  let num = p / g;
  let den = q / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const s = den === 1 ? `${Math.abs(num)}` : `${Math.abs(num)}/${den}`;
  return num < 0 ? `−${s}` : s;
}

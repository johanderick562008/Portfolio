/**
 * Browser port of the idea behind the Python Number-to-words program:
 * group digits the Indian way (3 · 2 · 2 · …) and name each group.
 * Like the original, digits above the crore place are themselves expressed
 * in lakhs/thousands and followed by "crore".
 */

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function below100(n: number): string {
  if (n < 20) return ONES[n];
  return [TENS[Math.floor(n / 10)], ONES[n % 10]].filter(Boolean).join("-");
}

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} hundred` : "", rest ? below100(rest) : ""].filter(Boolean).join(" ");
}

function belowCrore(n: number): string {
  const lakh = Math.floor(n / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  return [
    lakh ? `${below100(lakh)} lakh` : "",
    thousand ? `${below100(thousand)} thousand` : "",
    rest ? below1000(rest) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function convert(n: bigint): string {
  const CRORE = 10_000_000n;
  if (n < CRORE) return belowCrore(Number(n));
  const high = n / CRORE;
  const low = n % CRORE;
  return [`${convert(high)} crore`, low ? belowCrore(Number(low)) : ""].filter(Boolean).join(" ");
}

export const MAX_DIGITS = 21;

export type WordsResult =
  | { ok: true; words: string; grouped: string }
  | { ok: false; error: string };

/** Formats digits with Indian grouping, e.g. 12345678 -> 1,23,45,678 */
export function indianGrouping(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${head},${last3}`;
}

export function toIndianWords(input: string): WordsResult {
  const raw = input.replace(/[,\s_]/g, "");
  if (raw === "") return { ok: false, error: "Enter a whole number." };
  if (!/^\d+$/.test(raw)) return { ok: false, error: "Whole numbers only, with no signs or decimals, like the original." };
  const digits = raw.replace(/^0+(?=\d)/, "");
  if (digits.length > MAX_DIGITS) return { ok: false, error: `Up to ${MAX_DIGITS} digits in this demo.` };
  const n = BigInt(digits);
  const words = n === 0n ? "zero" : convert(n);
  return { ok: true, words, grouped: indianGrouping(digits) };
}

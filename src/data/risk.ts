/**
 * Numbers from the student-risk-prediction repository: reports/metrics.json,
 * reports/model_comparison.csv, models/model_metadata.json and README §7–§14
 * (training run of 4 Oct 2026, random_state 42). Don't round differently here
 * than in the README.
 */

export const REPO = "https://github.com/johanderick562008/student-risk-prediction";
export const LABELS = ["Low", "Medium", "High"] as const;

export type ModelId = "baseline" | "rule" | "logreg" | "tree" | "forest" | "leak";

export interface ModelResult {
  id: ModelId;
  name: string;
  short: string;
  why: string;
  test: { acc: number; f1: number; highP: number; highR: number };
  cv?: { acc: number; f1: number; highP: number; highR: number };
  /** Test-set confusion matrix, rows = true Low/Medium/High, columns = predicted. */
  confusion?: number[][];
  selected?: boolean;
  reference?: boolean;
}

export const MODELS: ModelResult[] = [
  {
    id: "baseline",
    name: "Most-frequent class",
    short: "Baseline",
    why: "The score of no model at all: call everyone High.",
    test: { acc: 0.3633, f1: 0.1776, highP: 0.3633, highR: 1 },
    confusion: [[0, 0, 695], [0, 0, 553], [0, 0, 712]],
  },
  {
    id: "rule",
    name: "Attendance-only rule",
    short: "Rule",
    why: "The risk rule, using only what's known before the final.",
    test: { acc: 0.8071, f1: 0.7996, highP: 1, highR: 0.7725 },
    confusion: [[695, 0, 0], [216, 337, 0], [116, 46, 550]],
  },
  {
    id: "logreg",
    name: "Logistic Regression",
    short: "LogReg",
    why: "Simple, linear, interpretable.",
    test: { acc: 0.6883, f1: 0.676, highP: 0.8341, highR: 0.7978 },
    cv: { acc: 0.7008, f1: 0.6869, highP: 0.8267, highR: 0.8343 },
    confusion: [[498, 197, 0], [157, 283, 113], [90, 54, 568]],
  },
  {
    id: "tree",
    name: "Decision Tree",
    short: "Tree",
    why: "Readable if-then rules. Max depth 4.",
    test: { acc: 0.8071, f1: 0.7996, highP: 1, highR: 0.7725 },
    cv: { acc: 0.8326, f1: 0.8262, highP: 0.9996, highR: 0.8118 },
    confusion: [[695, 0, 0], [216, 337, 0], [116, 46, 550]],
    selected: true,
  },
  {
    id: "forest",
    name: "Random Forest",
    short: "Forest",
    why: "200 trees voting. Usually stronger, harder to read.",
    test: { acc: 0.8071, f1: 0.7998, highP: 1, highR: 0.7725 },
    cv: { acc: 0.8317, f1: 0.8253, highP: 0.9991, highR: 0.8118 },
    confusion: [[694, 1, 0], [215, 338, 0], [116, 46, 550]],
  },
  {
    id: "leak",
    name: "Random Forest + Total_Score",
    short: "Leak",
    why: "The same forest, allowed to see the column the labels were built from.",
    test: { acc: 0.9995, f1: 0.9995, highP: 1, highR: 1 },
    reference: true,
  },
];

export const DATA_FACTS = [
  { k: "10,030", v: "rows × 21 columns from Kaggle" },
  { k: "30", v: "exact duplicate rows, removed" },
  { k: "r = −0.011", v: "attendance vs. Total_Score: no relationship" },
  { k: "202", v: "students with no attendance, left unlabelled" },
];

export const QUIRKS = [
  "Impossible values: age −3 and 87, attendance 135%, a midterm of 145.",
  "Eight spellings of four departments, and a number stored as \"\\t41\".",
  "Every score is almost perfectly uniform. Real marks cluster around an average.",
  "Grade contradicts Total_Score: the median total is about 75 for every grade from A to F.",
];

export const RULE = [
  { level: "High", cond: "attendance < 65%  or  Total_Score < 55" },
  { level: "Medium", cond: "attendance < 75%  or  Total_Score < 65" },
  { level: "Low", cond: "everything else" },
];

export const TREE_RULES = `Attendance <= 64.99  -> High
Attendance <= 74.99  -> Medium
otherwise            -> Low`;

export const POLICY = [
  { name: "Brief: Total < 50", low: "3,476", med: "3,460", high: "2,862", note: "The lowest Total_Score is 50.02, so this condition matched nobody." },
  { name: "Used: Total < 55", low: "3,476", med: "2,762", high: "3,560", note: "Roughly the bottom 10% of Total_Score." },
];

export const FEATURES_USED = ["Attendance (%)", "Midterm_Score", "Assignments_Avg", "Quizzes_Avg", "Participation_Score", "Projects_Score", "test_preparation_course"];

export const EXCLUDED: { col: string; why: string }[] = [
  { col: "Total_Score", why: "The label is built from it: direct leakage." },
  { col: "Grade", why: "Derived from the final result, and inconsistent with Total_Score." },
  { col: "Final_Score", why: "Not known before the final assessment." },
  { col: "Gender, Age, Department", why: "Demographic. A fairness risk, with no educational reason to use them." },
  { col: "Names, emails, IDs", why: "Personal identifiers. Replaced with anonymous IDs." },
];

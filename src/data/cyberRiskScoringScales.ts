import type { RagDataVizKey } from "./ragDataVisualization.js";
import { RAG_FIVE_POINT_BAND_KEYS } from "./ragDataVisualization.js";

export type ScoringScaleKind = "cyberRiskScore" | "likelihood";

export type ScoringBandRow = {
  /** Level index 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  name: "Very low" | "Low" | "Medium" | "High" | "Very high";
  rag: RagDataVizKey;
  from: number;
  to: number;
  description: string;
};

const NAMES: ScoringBandRow["name"][] = ["Very low", "Low", "Medium", "High", "Very high"];

function rowsFrom(
  pairs: { from: number; to: number }[],
  descriptions: string[],
): ScoringBandRow[] {
  return RAG_FIVE_POINT_BAND_KEYS.map((rag, i) => ({
    level: (i + 1) as ScoringBandRow["level"],
    name: NAMES[i]!,
    rag,
    from: pairs[i]!.from,
    to: pairs[i]!.to,
    description: descriptions[i]!,
  }));
}

/** Figma: Cyber risk score (Impact × Likelihood, 1–125). */
export const DEFAULT_CYBER_RISK_SCORE_BANDS: ScoringBandRow[] = rowsFrom(
  [
    { from: 1, to: 25 },
    { from: 26, to: 50 },
    { from: 51, to: 75 },
    { from: 76, to: 100 },
    { from: 101, to: 125 },
  ],
  [
    "Negligible business impact. No disruption to operations, no financial loss expected, and no regulatory exposure. Risk can be accepted or monitored without active treatment.",
    "Minor impact on isolated systems or processes. Limited financial exposure and short recovery time. Routine controls are sufficient; risk owner should monitor quarterly.",
    "Moderate disruption to business operations or sensitive data. Noticeable financial or reputational impact possible. Requires a documented mitigation plan and assigned owner.",
    "Significant operational or financial impact. Potential for regulatory breach, data loss, or prolonged downtime. Immediate mitigation action and senior oversight required.",
    "Severe or critical impact across multiple systems or business units. Major financial loss, regulatory penalties, or reputational damage likely. Escalate immediately; treatment plan mandatory before next assessment cycle.",
  ],
);

/**
 * Likelihood product bands (1–25). Aligns with {@link LIKELIHOOD_OPTIONS} in ScoringMetricField.
 */
export const DEFAULT_LIKELIHOOD_BANDS: ScoringBandRow[] = rowsFrom(
  [
    { from: 1, to: 5 },
    { from: 6, to: 10 },
    { from: 11, to: 15 },
    { from: 16, to: 20 },
    { from: 21, to: 25 },
  ],
  [
    "Rare or negligible probability under current controls. Poses minimal concern for prioritization; monitor in periodic reviews.",
    "Uncommon but possible exposure. May materialize if controls weaken; track trends and keep compensating measures current.",
    "Credible and periodic exposure. Requires scheduled reviews, clear ownership, and timely remediation of control gaps.",
    "Likely without strong mitigation. Near-term action plan and management attention are expected; escalate blockers early.",
    "Imminent or highly likely under observed conditions. Treat as top priority: immediate containment, resource allocation, and execution oversight.",
  ],
);

export function deepCloneBands(rows: ScoringBandRow[]): ScoringBandRow[] {
  return rows.map((r) => ({ ...r }));
}

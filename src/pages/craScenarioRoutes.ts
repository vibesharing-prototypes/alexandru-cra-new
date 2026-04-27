/** Routes under the new CRA “scenario” detail area (scoring rationale vs read-only). */

export const CRA_SCENARIO_BASE_PATH = "/cyber-risk/cyber-risk-assessments/new/scenario";

export const SCENARIO_RATIONALE_READ_ONLY_SEGMENT = "rationale-read-only";

export function scenarioScoringRationalePath(scenarioId: string): string {
  return `${CRA_SCENARIO_BASE_PATH}/${encodeURIComponent(scenarioId)}`;
}

export function scenarioRationaleReadOnlyPath(scenarioId: string): string {
  return `${CRA_SCENARIO_BASE_PATH}/${encodeURIComponent(scenarioId)}/${SCENARIO_RATIONALE_READ_ONLY_SEGMENT}`;
}

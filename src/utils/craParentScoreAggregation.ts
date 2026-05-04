/**
 * Parent cyber-risk row aggregation when "Average" (persisted `average`) is selected.
 * Impact, threat, and vulnerability are simple arithmetic means across scenarios; round after dividing.
 */

export type ScenarioNumericScores = {
  impact: number;
  threat: number;
  vulnerability: number;
};

function clampFivePoint(n: number): number {
  return Math.min(5, Math.max(1, n));
}

/**
 * Returns aggregated impact, threat, and vulnerability (1–5 integers).
 * Single scenario: pass-through without rounding/clamping beyond catalog values.
 * Multiple scenarios: arithmetic mean per metric, Math.round after divide, then clamp to 1–5.
 * Null when no inputs (caller shows dash).
 */
export function aggregateArithmeticMeanParentScores(
  scenarios: readonly ScenarioNumericScores[],
): { impact: number; threat: number; vulnerability: number } | null {
  if (scenarios.length === 0) return null;
  if (scenarios.length === 1) {
    const s = scenarios[0]!;
    return {
      impact: s.impact,
      threat: s.threat,
      vulnerability: s.vulnerability,
    };
  }

  const n = scenarios.length;
  const sumImpact = scenarios.reduce((acc, s) => acc + s.impact, 0);
  const sumThreat = scenarios.reduce((acc, s) => acc + s.threat, 0);
  const sumVulnerability = scenarios.reduce((acc, s) => acc + s.vulnerability, 0);

  const impactAgg = Math.round(sumImpact / n);
  const threatAgg = Math.round(sumThreat / n);
  const vulnerabilityAgg = Math.round(sumVulnerability / n);

  return {
    impact: clampFivePoint(impactAgg),
    threat: clampFivePoint(threatAgg),
    vulnerability: clampFivePoint(vulnerabilityAgg),
  };
}

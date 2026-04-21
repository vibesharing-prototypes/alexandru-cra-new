import { controls } from "./controls.js";
import { cyberRisks } from "./cyberRisks.js";
import { scenarios } from "./scenarios.js";
import { threats } from "./threats.js";
import {
  isVulnerabilityActiveForAssessment,
  vulnerabilities,
} from "./vulnerabilities.js";
import type { MockControl, MockCyberRisk, MockScenario, MockThreat } from "./types.js";

export function includedAssetIdSet(rows: { included: boolean; assetId: string }[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    if (r.included) s.add(r.assetId);
  }
  return s;
}

/** Cyber risks touching any included asset (before user exclusions). */
export function candidateScopedCyberRisks(assetIds: Set<string>): MockCyberRisk[] {
  if (assetIds.size === 0) return [];
  return cyberRisks.filter((cr) => cr.assetIds.some((aid) => assetIds.has(aid)));
}

export function assessmentScopedCyberRisks(
  assetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
): MockCyberRisk[] {
  return candidateScopedCyberRisks(assetIds).filter((cr) => !excludedCyberRiskIds.has(cr.id));
}

export function effectiveCyberRiskIdSet(
  assetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
): Set<string> {
  return new Set(assessmentScopedCyberRisks(assetIds, excludedCyberRiskIds).map((r) => r.id));
}

export function assessmentScopedThreats(
  assetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
): MockThreat[] {
  const effectiveIds = effectiveCyberRiskIdSet(assetIds, excludedCyberRiskIds);
  if (assetIds.size === 0 || effectiveIds.size === 0) return [];
  return threats.filter(
    (t) =>
      t.assetIds.some((aid) => assetIds.has(aid)) &&
      t.cyberRiskIds.some((id) => effectiveIds.has(id)),
  );
}

export function assessmentScopedVulnerabilities(assetIds: Set<string>) {
  if (assetIds.size === 0) return [];
  return vulnerabilities.filter(
    (v) =>
      isVulnerabilityActiveForAssessment(v) && v.assetIds.some((aid) => assetIds.has(aid)),
  );
}

export function assessmentScopedControls(
  assetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
): MockControl[] {
  if (assetIds.size === 0) return [];
  const crIds = effectiveCyberRiskIdSet(assetIds, excludedCyberRiskIds);
  return controls.filter((c) => c.cyberRiskIds.some((id) => crIds.has(id)));
}

export function assessmentScopedScenarios(
  assetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
): MockScenario[] {
  if (assetIds.size === 0) return [];
  const riskIds = effectiveCyberRiskIdSet(assetIds, excludedCyberRiskIds);
  return scenarios.filter(
    (s) => assetIds.has(s.assetId) && riskIds.has(s.cyberRiskId),
  );
}

/** @deprecated Prefer assessmentScopedCyberRisks(assetIds, new Set()) */
export function scopedCyberRisks(assetIds: Set<string>): MockCyberRisk[] {
  return assessmentScopedCyberRisks(assetIds, new Set());
}

export function scopedThreats(assetIds: Set<string>): MockThreat[] {
  return assessmentScopedThreats(assetIds, new Set());
}

export function scopedVulnerabilities(assetIds: Set<string>) {
  return assessmentScopedVulnerabilities(assetIds);
}

export function scopedControls(assetIds: Set<string>): MockControl[] {
  return assessmentScopedControls(assetIds, new Set());
}

export function scopedScenarios(assetIds: Set<string>): MockScenario[] {
  return assessmentScopedScenarios(assetIds, new Set());
}

export const SCOPE_CATALOG_TOTALS = {
  cyberRisks: cyberRisks.length,
  threats: threats.length,
  vulnerabilities: vulnerabilities.filter(isVulnerabilityActiveForAssessment).length,
  controls: controls.length,
} as const;

import { scenarios as catalogScenarios } from "./scenarios.js";
import { assets } from "./assets.js";
import { getFivePointLabel } from "./types.js";
import type { AssessmentScenario } from "./craAssessmentDraftTypes.js";
import type { FivePointScaleValue } from "./types.js";

/**
 * Build assessment-scoped scenario instances from catalog scenarios.
 * Only includes scenarios whose assets are in `includedAssetIds` and whose
 * cyber risks are NOT in `excludedCyberRiskIds`.
 *
 * Each assessment scenario gets:
 * - A new unique ID (ASC-{assessmentId}-{seq})
 * - Impact pre-filled from asset criticality
 * - All other scores set to null (unscored)
 * - A reference back to the source catalog scenario
 */
export function buildAssessmentScenarios(
  assessmentId: string,
  includedAssetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
  excludedScenarioIds: ReadonlySet<string> = new Set(),
): AssessmentScenario[] {
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const filteredCatalogScenarios = catalogScenarios.filter((s) => {
    if (!includedAssetIds.has(s.assetId)) return false;
    if (excludedCyberRiskIds.has(s.cyberRiskId)) return false;
    if (excludedScenarioIds.has(s.id)) return false;
    return true;
  });

  const result: AssessmentScenario[] = [];
  let seq = 0;

  for (const catalogScenario of filteredCatalogScenarios) {
    seq += 1;
    const asset = assetById.get(catalogScenario.assetId);
    if (!asset) continue; // Should not happen if catalog is consistent

    const impact = asset.criticality;
    const impactLabel = getFivePointLabel(impact as FivePointScaleValue);

    result.push({
      id: `ASC-${assessmentId}-${String(seq).padStart(3, "0")}`,
      sourceCatalogScenarioId: catalogScenario.id,
      name: catalogScenario.name,
      ownerId: catalogScenario.ownerId,
      cyberRiskId: catalogScenario.cyberRiskId,
      assetId: catalogScenario.assetId,
      impact,
      impactLabel,
      threatSeverity: null,
      threatSeverityLabel: null,
      vulnerabilitySeverity: null,
      vulnerabilitySeverityLabel: null,
      likelihood: null,
      likelihoodLabel: null,
      cyberRiskScore: null,
      cyberRiskScoreLabel: null,
      threatIds: [...catalogScenario.threatIds],
      vulnerabilityIds: [...catalogScenario.vulnerabilityIds],
      scoringRationale: catalogScenario.scoringRationale,
      relationships: {
        cyberRiskId: catalogScenario.relationships.cyberRiskId,
        assetId: catalogScenario.relationships.assetId,
        threatIds: [...catalogScenario.relationships.threatIds],
        vulnerabilityIds: [...catalogScenario.relationships.vulnerabilityIds],
        controlIds: [...catalogScenario.relationships.controlIds],
        mitigationPlanIds: [...catalogScenario.relationships.mitigationPlanIds],
      },
    });
  }

  return result;
}

/** Shared CRA new-assessment draft model (used by page storage + catalog persistence). */

import type { FivePointScaleValue, FivePointScaleLabel } from "./types.js";

/**
 * Assessment-scoped scenario instance created when an assessment is started.
 * Derived from a catalog scenario but has independent scoring lifecycle.
 */
export type AssessmentScenario = {
  /** Unique ID for this assessment scenario (format: "ASC-{assessmentId}-{seq}") */
  id: string;

  /** Reference back to the catalog scenario this was derived from */
  sourceCatalogScenarioId: string;

  /** Display name (copied from catalog scenario at creation time) */
  name: string;

  /** Owner ID (copied from catalog scenario's asset owner) */
  ownerId: string;

  /** Cyber risk this scenario belongs to */
  cyberRiskId: string;

  /** Asset being assessed */
  assetId: string;

  /** Impact score (pre-filled from asset criticality) */
  impact: FivePointScaleValue;
  impactLabel: FivePointScaleLabel;

  /** Threat severity (initially null, scored during assessment) */
  threatSeverity: FivePointScaleValue | null;
  threatSeverityLabel: FivePointScaleLabel | null;

  /** Vulnerability severity (initially null, scored during assessment) */
  vulnerabilitySeverity: FivePointScaleValue | null;
  vulnerabilitySeverityLabel: FivePointScaleLabel | null;

  /** Likelihood (derived: threat × vulnerability, initially null) */
  likelihood: number | null;
  likelihoodLabel: FivePointScaleLabel | null;

  /** Cyber risk score (derived: impact × likelihood, initially null) */
  cyberRiskScore: number | null;
  cyberRiskScoreLabel: FivePointScaleLabel | null;

  /** Threat IDs linked to this scenario */
  threatIds: string[];

  /** Vulnerability IDs linked to this scenario */
  vulnerabilityIds: string[];

  /** Scoring rationale text (copied from catalog scenario, can be edited) */
  scoringRationale: string;

  /** Relationships (control IDs, mitigation plan IDs) */
  relationships: {
    cyberRiskId: string;
    assetId: string;
    threatIds: string[];
    vulnerabilityIds: string[];
    controlIds: string[];
    mitigationPlanIds: string[];
  };
};

export type AssessmentPhase =
  | "draft"
  | "scoping"
  | "inProgress"
  | "review"
  | "overdue"
  | "assessmentApproved";

export type AiScoringPhase = "idle" | "processing" | "complete";

export type CraScoringTypeChoice = "inherent" | "residual";

/** How parent cyber-risk rows aggregate scenario scores in the Scoring tab. */
export type CraScenarioScoreAggregationMethod = "highest" | "average";

export type ScopeSubView =
  | "overview"
  | "assets"
  | "scopedCyberRisks"
  | "scopedThreats"
  | "scopedVulnerabilities"
  | "scopedControls";

export type CraNewAssessmentPersistedDraft = {
  activeTab: number;
  assessmentPhase: AssessmentPhase;
  name: string;
  assessmentId: string;
  assessmentType: string;
  startDate: string;
  dueDate: string;
  ownerIds: string[];
  scopeSubView: ScopeSubView;
  includedScopeAssetIds: string[];
  /** Cyber risk library ids explicitly removed from this assessment (still in candidate set from assets). */
  excludedScopeCyberRiskIds: string[];
  /** Threat library ids explicitly excluded while still linked to candidate scope. */
  excludedScopeThreatIds: string[];
  excludedScopeVulnerabilityIds: string[];
  excludedScopeControlIds: string[];
  aiScoringPhase: AiScoringPhase;
  scoringType: CraScoringTypeChoice;
  scenarioScoreAggregationMethod: CraScenarioScoreAggregationMethod;
  /** Scenario library ids marked n/a for this assessment (excluded from parent aggregation). */
  scenarioNotApplicableIds: string[];
  /** Scenario library ids explicitly removed from this assessment (hidden from scoring/results). */
  excludedScopeScenarioIds: string[];
  /**
   * Assessment-scoped scenario instances created for this assessment.
   * These are derived from catalog scenarios but have independent scoring lifecycle.
   * Created when assessment scope is finalized.
   */
  assessmentScenarios?: AssessmentScenario[];
};

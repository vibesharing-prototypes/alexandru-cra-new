import { assets } from "../data/assets.js";
import type { CraRagKey } from "../data/craScoringScenarioLibrary.js";
import type { MockCyberRisk, MockScenario, FivePointScaleLabel } from "../data/types.js";
import {
  fivePointLabelToRag,
  getCyberRiskScoreLabel,
  getLikelihoodLabel,
} from "../data/types.js";
import { shouldMaskScenarioRowCatalogScores } from "../utils/assessmentScenarioCatalogScoreVisibility.js";
import {
  assessmentScopedCyberRisks,
  assessmentScopedScenarios,
} from "./scopeAssessmentRollup.js";

type ResultScoreChip = { numeric: string; label: string; rag: CraRagKey };

export type AssessmentCyberResultsRow = {
  id: string;
  kind: "cyberRisk" | "scenario";
  groupId: string;
  name: string;
  impact: ResultScoreChip | null;
  threat: ResultScoreChip | null;
  vulnerability: ResultScoreChip | null;
  likelihood: ResultScoreChip | null;
  cyberRiskScore: ResultScoreChip | null;
};

function chipFive(value: number, label: FivePointScaleLabel): ResultScoreChip {
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

function chipLikelihood(value: number): ResultScoreChip {
  const label = getLikelihoodLabel(value);
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

function chipCyberRiskScore(value: number): ResultScoreChip {
  const label = getCyberRiskScoreLabel(value);
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

type ScenarioMetricChips = {
  impact: ResultScoreChip;
  threat: ResultScoreChip;
  vulnerability: ResultScoreChip;
  likelihood: ResultScoreChip;
  cyberRiskScore: ResultScoreChip;
};

function scenarioRowChips(s: MockScenario): ScenarioMetricChips {
  return {
    impact: chipFive(s.impact, s.impactLabel),
    threat: chipFive(s.threatSeverity, s.threatSeverityLabel),
    vulnerability: chipFive(s.vulnerabilitySeverity, s.vulnerabilitySeverityLabel),
    likelihood: chipLikelihood(s.likelihood),
    cyberRiskScore: chipCyberRiskScore(s.cyberRiskScore),
  };
}

function maxChip(a: ResultScoreChip, b: ResultScoreChip): ResultScoreChip {
  return Number.parseFloat(a.numeric) >= Number.parseFloat(b.numeric) ? a : b;
}

function riskRowChips(
  cr: MockCyberRisk,
  scens: MockScenario[],
): Omit<AssessmentCyberResultsRow, "id" | "kind" | "groupId" | "name"> {
  if (scens.length === 0) {
    const imp = chipFive(cr.impact, cr.impactLabel);
    const lik = chipLikelihood(cr.likelihood);
    const crs = chipCyberRiskScore(cr.cyberRiskScore);
    return {
      impact: imp,
      threat: imp,
      vulnerability: imp,
      likelihood: lik,
      cyberRiskScore: crs,
    };
  }
  const chips: ScenarioMetricChips[] = scens.map((s) => scenarioRowChips(s));
  const [head, ...rest] = chips;
  return {
    impact: rest.reduce((a, c) => maxChip(a, c.impact), head!.impact),
    threat: rest.reduce((a, c) => maxChip(a, c.threat), head!.threat),
    vulnerability: rest.reduce((a, c) => maxChip(a, c.vulnerability), head!.vulnerability),
    likelihood: rest.reduce((a, c) => maxChip(a, c.likelihood), head!.likelihood),
    cyberRiskScore: rest.reduce((a, c) => maxChip(a, c.cyberRiskScore), head!.cyberRiskScore),
  };
}

/** Cyber risk + scenario rows for Results, aligned with scoped Scoring data. */
export function buildCyberResultsRowsForScope(
  includedAssetIds: Set<string>,
  excludedScopeCyberRiskIds: Set<string>,
  excludedScopeScenarioIds: Set<string> = new Set(),
): AssessmentCyberResultsRow[] {
  if (includedAssetIds.size === 0) return [];
  const risks = assessmentScopedCyberRisks(includedAssetIds, excludedScopeCyberRiskIds);
  const scenarioList = assessmentScopedScenarios(
    includedAssetIds,
    excludedScopeCyberRiskIds,
    excludedScopeScenarioIds,
  );
  const byRisk = new Map<string, MockScenario[]>();
  for (const s of scenarioList) {
    const list = byRisk.get(s.cyberRiskId) ?? [];
    list.push(s);
    byRisk.set(s.cyberRiskId, list);
  }

  const rows: AssessmentCyberResultsRow[] = [];
  for (const cr of risks) {
    const scens = byRisk.get(cr.id) ?? [];
    const rc = riskRowChips(cr, scens);
    rows.push({
      id: cr.id,
      kind: "cyberRisk",
      groupId: cr.id,
      name: cr.name,
      ...rc,
    });
    for (const s of scens) {
      const sc = scenarioRowChips(s);
      rows.push({
        id: s.id,
        kind: "scenario",
        groupId: cr.id,
        name: s.name,
        ...sc,
      });
    }
  }
  return rows;
}

function allApplicableScenarioRowsFullyScored(
  scenarioRows: AssessmentCyberResultsRow[],
  scenarioNotApplicableIds: ReadonlySet<string>,
): boolean {
  const applicable = scenarioRows.filter((r) => !scenarioNotApplicableIds.has(r.id));
  if (applicable.length === 0) return false;
  return applicable.every(
    (r) =>
      r.impact != null &&
      r.threat != null &&
      r.vulnerability != null &&
      r.likelihood != null &&
      r.cyberRiskScore != null,
  );
}

function aggregateParentChipsFromScenarios(
  scenarios: AssessmentCyberResultsRow[],
): Pick<AssessmentCyberResultsRow, "impact" | "threat" | "vulnerability" | "likelihood" | "cyberRiskScore"> {
  const chips = scenarios.map((s) => ({
    impact: s.impact!,
    threat: s.threat!,
    vulnerability: s.vulnerability!,
    likelihood: s.likelihood!,
    cyberRiskScore: s.cyberRiskScore!,
  }));
  const [head, ...rest] = chips;
  return {
    impact: rest.reduce((a, c) => maxChip(a, c.impact), head!.impact),
    threat: rest.reduce((a, c) => maxChip(a, c.threat), head!.threat),
    vulnerability: rest.reduce((a, c) => maxChip(a, c.vulnerability), head!.vulnerability),
    likelihood: rest.reduce((a, c) => maxChip(a, c.likelihood), head!.likelihood),
    cyberRiskScore: rest.reduce((a, c) => maxChip(a, c.cyberRiskScore), head!.cyberRiskScore),
  };
}

const NULL_METRICS: Pick<
  AssessmentCyberResultsRow,
  "impact" | "threat" | "vulnerability" | "likelihood" | "cyberRiskScore"
> = {
  impact: null,
  threat: null,
  vulnerability: null,
  likelihood: null,
  cyberRiskScore: null,
};

/**
 * Mirrors Scoring-tab behavior: when global masking is on, scenario rows hide T/V/L/CRS (impact stays);
 * parent cyber-risk rows aggregate only when every non–N/A scenario shows full metrics, else all null.
 */
export function applyCatalogScoreMaskToCyberResultsRows(
  rows: AssessmentCyberResultsRow[],
  params: {
    globalMask: boolean;
    scenarioNotApplicableIds: ReadonlySet<string>;
    scenarioManuallyRevealedScoreIds: ReadonlySet<string>;
  },
): AssessmentCyberResultsRow[] {
  if (!params.globalMask) return rows;

  type Group = { parent: AssessmentCyberResultsRow; scenarios: AssessmentCyberResultsRow[] };
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const r of rows) {
    if (r.kind === "cyberRisk") {
      if (current) groups.push(current);
      current = { parent: r, scenarios: [] };
    } else if (current) {
      current.scenarios.push(r);
    }
  }
  if (current) groups.push(current);

  const out: AssessmentCyberResultsRow[] = [];
  for (const g of groups) {
    const maskedScenarios = g.scenarios.map((s) => {
      const mask = shouldMaskScenarioRowCatalogScores(s.id, {
        globalMask: true,
        scenarioNotApplicableIds: params.scenarioNotApplicableIds,
        scenarioManuallyRevealedScoreIds: params.scenarioManuallyRevealedScoreIds,
      });
      if (!mask) return s;
      return {
        ...s,
        threat: null,
        vulnerability: null,
        likelihood: null,
        cyberRiskScore: null,
      };
    });

    const applicableForAgg = maskedScenarios.filter((s) => !params.scenarioNotApplicableIds.has(s.id));
    const metrics = allApplicableScenarioRowsFullyScored(maskedScenarios, params.scenarioNotApplicableIds)
      ? aggregateParentChipsFromScenarios(applicableForAgg)
      : NULL_METRICS;

    out.push({
      ...g.parent,
      ...metrics,
    });
    for (const s of maskedScenarios) {
      out.push(s);
    }
  }
  return out;
}

export type AssessmentAssetResultRow = {
  id: string;
  name: string;
  assetId: string;
  cyberRiskScore: ResultScoreChip | null;
  criticality: ResultScoreChip;
  confidentiality: ResultScoreChip;
  integrity: ResultScoreChip;
  availability: ResultScoreChip;
};

function maxScenarioCyberRiskChip(scens: MockScenario[]): ResultScoreChip {
  let best = scens[0]!;
  for (const s of scens) {
    if (s.cyberRiskScore > best.cyberRiskScore) best = s;
  }
  return chipCyberRiskScore(best.cyberRiskScore);
}

/** Asset rows on Results for assets in scope (scores from scenarios on that asset). */
export function buildAssetResultRowsForScope(
  includedAssetIds: Set<string>,
  excludedScopeCyberRiskIds: Set<string>,
  excludedScopeScenarioIds: Set<string> = new Set(),
): AssessmentAssetResultRow[] {
  if (includedAssetIds.size === 0) return [];
  const scenarioList = assessmentScopedScenarios(
    includedAssetIds,
    excludedScopeCyberRiskIds,
    excludedScopeScenarioIds,
  );
  const byAsset = new Map<string, MockScenario[]>();
  for (const s of scenarioList) {
    const list = byAsset.get(s.assetId) ?? [];
    list.push(s);
    byAsset.set(s.assetId, list);
  }

  const list = assets.filter((a) => includedAssetIds.has(a.id));
  return list.map((a, i) => {
    const scens = byAsset.get(a.id) ?? [];
    const crs =
      scens.length === 0
        ? chipCyberRiskScore(a.criticality * 10)
        : maxScenarioCyberRiskChip(scens);
    const crit = chipFive(a.criticality, a.criticalityLabel);
    return {
      id: String(i + 1),
      name: a.name,
      assetId: a.id,
      cyberRiskScore: crs,
      criticality: crit,
      confidentiality: crit,
      integrity: crit,
      availability: crit,
    };
  });
}

export function applyCatalogScoreMaskToAssetResultRows(
  rows: AssessmentAssetResultRow[],
  globalMask: boolean,
): AssessmentAssetResultRow[] {
  if (!globalMask) return rows;
  return rows.map((r) => ({ ...r, cyberRiskScore: null }));
}

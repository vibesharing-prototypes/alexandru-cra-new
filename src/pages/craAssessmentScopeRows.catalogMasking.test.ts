import { describe, expect, it } from "vitest";

import { cyberRisks } from "../data/cyberRisks.js";
import { scenarios } from "../data/scenarios.js";
import {
  applyNewCraCatalogScoreMaskingToAssetResultsRows,
  applyNewCraCatalogScoreMaskingToCyberResultsRows,
  assessmentResultsHasHiddenScenarioScores,
  buildAssetResultRowsForScope,
  buildCyberResultsRowsForScope,
  type AssessmentResultsCatalogMaskParams,
} from "./craAssessmentScopeRows.js";

function maskParams(p: Partial<AssessmentResultsCatalogMaskParams>): AssessmentResultsCatalogMaskParams {
  return {
    assessmentPhase: "inProgress",
    aiScoringPhase: "complete",
    isNewCraDraftFlow: false,
    scenarioCatalogScoresReleased: true,
    scenarioManuallyRevealedScoreIds: new Set<string>(),
    scenarioNotApplicableIds: new Set<string>(),
    ...p,
  };
}

describe("applyNewCraCatalogScoreMaskingToCyberResultsRows", () => {
  const cr = cyberRisks.find((r) => scenarios.some((s) => s.cyberRiskId === r.id));
  if (!cr) throw new Error("fixture: need a cyber risk with at least one scenario");
  const scensForRisk = scenarios.filter((s) => s.cyberRiskId === cr.id);
  if (scensForRisk.length < 1) throw new Error("fixture: need scenarios");

  const assetId = scensForRisk[0]!.assetId;
  const included = new Set([assetId]);
  const raw = buildCyberResultsRowsForScope(included, new Set(), new Set());
  const risksById = new Map(cyberRisks.map((r) => [r.id, r] as const));
  const byRisk = new Map<string, typeof scensForRisk>();
  for (const s of scenarios.filter((x) => included.has(x.assetId))) {
    const list = byRisk.get(s.cyberRiskId) ?? [];
    list.push(s);
    byRisk.set(s.cyberRiskId, list);
  }

  it("returns the same reference when assessment is approved", () => {
    const out = applyNewCraCatalogScoreMaskingToCyberResultsRows(
      raw,
      risksById,
      byRisk,
      maskParams({ assessmentPhase: "assessmentApproved" }),
    );
    expect(out).toBe(raw);
  });

  it("does not mask when in progress, AI complete, and not new CRA draft", () => {
    const out = applyNewCraCatalogScoreMaskingToCyberResultsRows(
      raw,
      risksById,
      byRisk,
      maskParams({
        assessmentPhase: "inProgress",
        aiScoringPhase: "complete",
        isNewCraDraftFlow: false,
      }),
    );
    const scenarioRows = out.filter((r) => r.kind === "scenario");
    expect(scenarioRows.length).toBeGreaterThan(0);
    expect(scenarioRows[0]!.threat).not.toBeNull();
  });

  it("masks non-impact scenario metrics in scoping for catalog assessments", () => {
    const out = applyNewCraCatalogScoreMaskingToCyberResultsRows(
      raw,
      risksById,
      byRisk,
      maskParams({
        assessmentPhase: "scoping",
        aiScoringPhase: "idle",
        isNewCraDraftFlow: false,
      }),
    );
    const scenarioRows = out.filter((r) => r.kind === "scenario");
    expect(scenarioRows.length).toBeGreaterThan(0);
    for (const row of scenarioRows) {
      expect(row.impact).not.toBeNull();
      expect(row.threat).toBeNull();
      expect(row.vulnerability).toBeNull();
      expect(row.likelihood).toBeNull();
      expect(row.cyberRiskScore).toBeNull();
    }
    const parents = out.filter((r) => r.kind === "cyberRisk");
    for (const row of parents) {
      expect(row.impact).toBeNull();
      expect(row.threat).toBeNull();
    }
  });

  it("restores parent row when every applicable scenario is manually revealed", () => {
    const applicableIds = raw
      .filter((r) => r.kind === "scenario")
      .map((r) => r.id)
      .filter((id) => !id.startsWith("N/A"));
    const out = applyNewCraCatalogScoreMaskingToCyberResultsRows(
      raw,
      risksById,
      byRisk,
      maskParams({
        assessmentPhase: "inProgress",
        aiScoringPhase: "complete",
        isNewCraDraftFlow: true,
        scenarioCatalogScoresReleased: false,
        scenarioManuallyRevealedScoreIds: new Set(applicableIds),
      }),
    );
    const parents = out.filter((r) => r.kind === "cyberRisk");
    const emptyNa = new Set<string>();
    for (const row of parents) {
      const groupScens = byRisk.get(row.id) ?? [];
      const applicable = groupScens.filter((s) => !emptyNa.has(s.id));
      if (applicable.length === 0) {
        expect(row.impact).toBeNull();
        continue;
      }
      expect(row.impact).not.toBeNull();
      expect(row.threat).not.toBeNull();
    }
  });
});

describe("applyNewCraCatalogScoreMaskingToAssetResultsRows", () => {
  const cr = cyberRisks.find((r) => scenarios.some((s) => s.cyberRiskId === r.id));
  if (!cr) throw new Error("fixture");
  const scensForRisk = scenarios.filter((s) => s.cyberRiskId === cr.id);
  const assetId = scensForRisk[0]!.assetId;
  const included = new Set([assetId]);
  const rawAssets = buildAssetResultRowsForScope(included, new Set(), new Set());
  const byAsset = new Map<string, typeof scensForRisk>();
  for (const s of scenarios.filter((x) => included.has(x.assetId))) {
    const list = byAsset.get(s.assetId) ?? [];
    list.push(s);
    byAsset.set(s.assetId, list);
  }

  it("masks asset cyber risk score when any applicable scenario is hidden", () => {
    const out = applyNewCraCatalogScoreMaskingToAssetResultsRows(
      rawAssets,
      byAsset,
      maskParams({
        assessmentPhase: "scoping",
        aiScoringPhase: "idle",
        isNewCraDraftFlow: false,
      }),
    );
    for (const row of out) {
      const sc = byAsset.get(row.assetId) ?? [];
      if (sc.length > 0) {
        expect(row.cyberRiskScore).toBeNull();
      }
    }
  });

  it("leaves asset cyber risk score when in progress and AI complete", () => {
    const out = applyNewCraCatalogScoreMaskingToAssetResultsRows(
      rawAssets,
      byAsset,
      maskParams({
        assessmentPhase: "inProgress",
        aiScoringPhase: "complete",
        isNewCraDraftFlow: false,
      }),
    );
    for (const row of out) {
      const sc = byAsset.get(row.assetId) ?? [];
      if (sc.length > 0) {
        expect(row.cyberRiskScore).not.toBeNull();
      }
    }
  });
});

describe("assessmentResultsHasHiddenScenarioScores", () => {
  it("is false when in progress, AI complete, and not new CRA draft", () => {
    expect(
      assessmentResultsHasHiddenScenarioScores(scenarios.slice(0, 3), {
        assessmentPhase: "inProgress",
        aiScoringPhase: "complete",
        isNewCraDraftFlow: false,
        scenarioCatalogScoresReleased: true,
        scenarioManuallyRevealedScoreIds: new Set(),
        scenarioNotApplicableIds: new Set(),
      }),
    ).toBe(false);
  });

  it("is true in scoping when an applicable scenario is not manually revealed", () => {
    const s = scenarios[0];
    if (!s) throw new Error("fixture");
    expect(
      assessmentResultsHasHiddenScenarioScores([s], {
        assessmentPhase: "scoping",
        aiScoringPhase: "idle",
        isNewCraDraftFlow: false,
        scenarioCatalogScoresReleased: true,
        scenarioManuallyRevealedScoreIds: new Set(),
        scenarioNotApplicableIds: new Set(),
      }),
    ).toBe(true);
  });

  it("is true when new CRA, unreleased, in progress with AI complete, and scenario not manually revealed", () => {
    const s = scenarios[0];
    if (!s) throw new Error("fixture");
    expect(
      assessmentResultsHasHiddenScenarioScores([s], {
        assessmentPhase: "inProgress",
        aiScoringPhase: "complete",
        isNewCraDraftFlow: true,
        scenarioCatalogScoresReleased: false,
        scenarioManuallyRevealedScoreIds: new Set(),
        scenarioNotApplicableIds: new Set(),
      }),
    ).toBe(true);
  });

  it("is false when every in-scope scenario is marked not applicable", () => {
    const subset = scenarios.slice(0, 3);
    if (subset.length === 0) return;
    expect(
      assessmentResultsHasHiddenScenarioScores(subset, {
        assessmentPhase: "scoping",
        aiScoringPhase: "idle",
        isNewCraDraftFlow: true,
        scenarioCatalogScoresReleased: false,
        scenarioManuallyRevealedScoreIds: new Set(),
        scenarioNotApplicableIds: new Set(subset.map((x) => x.id)),
      }),
    ).toBe(false);
  });
});

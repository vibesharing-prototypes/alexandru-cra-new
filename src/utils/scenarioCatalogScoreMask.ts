import type { AiScoringPhase, AssessmentPhase } from "../pages/craNewAssessmentDraftStorage.js";

/**
 * Shared inputs for whether catalog-backed scenario scores (non-impact) are shown on Scoring / Results.
 * Mirrors product rules: hide in early phases and until AI scoring completes; new CRA draft also respects
 * `scenarioCatalogScoresReleased` after AI.
 */
export type ScenarioCatalogMaskContext = {
  assessmentPhase: AssessmentPhase;
  aiScoringPhase: AiScoringPhase;
  isNewCraDraftFlow: boolean;
  scenarioCatalogScoresReleased: boolean;
  scenarioManuallyRevealedScoreIds: ReadonlySet<string>;
  scenarioNotApplicableIds: ReadonlySet<string>;
};

/**
 * When true, the Scoring / Results tables may show full catalog scores for this scenario (impact always
 * follows row data; this flag gates threat, vulnerability, likelihood, cyber risk score from catalog).
 */
export function scenarioCatalogScoresVisibleInAssessmentUi(
  scenarioId: string,
  ctx: ScenarioCatalogMaskContext,
): boolean {
  if (ctx.scenarioNotApplicableIds.has(scenarioId)) return true;
  if (ctx.scenarioManuallyRevealedScoreIds.has(scenarioId)) return true;
  if (ctx.assessmentPhase === "assessmentApproved") return true;

  if (
    ctx.assessmentPhase === "draft" ||
    ctx.assessmentPhase === "scoping" ||
    ctx.assessmentPhase === "overdue"
  ) {
    return false;
  }

  if (ctx.assessmentPhase === "inProgress" || ctx.assessmentPhase === "review") {
    if (ctx.aiScoringPhase !== "complete") return false;
    if (ctx.isNewCraDraftFlow && !ctx.scenarioCatalogScoresReleased) return false;
    return true;
  }

  return true;
}

/** True if any in-scope scenario is applicable and still has catalog scores hidden in the UI. */
export function assessmentUiHasHiddenScenarioCatalogScores(
  scenariosInScope: readonly { id: string }[],
  ctx: ScenarioCatalogMaskContext,
): boolean {
  return scenariosInScope.some(
    (s) =>
      !ctx.scenarioNotApplicableIds.has(s.id) && !scenarioCatalogScoresVisibleInAssessmentUi(s.id, ctx),
  );
}

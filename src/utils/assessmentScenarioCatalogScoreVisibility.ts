import type { AssessmentStatus } from "../data/types.js";

/** Catalog assessments in these list statuses hide T/V/L/CRS until mock AI releases scores. */
export function catalogAssessmentStatusNeedsScoreMasking(
  status: AssessmentStatus | undefined | null,
): boolean {
  return status === "Draft" || status === "Scoping";
}

/**
 * When true, scenario rows should hide catalog threat/vulnerability/likelihood/cyber risk score
 * (impact stays visible) until `scenarioCatalogScoresReleased` or per-scenario overrides.
 */
export function globalScenarioCatalogScoresShouldMask(params: {
  isNewCraDraftFlow: boolean;
  catalogAssessmentStatus: AssessmentStatus | undefined | null;
  scenarioCatalogScoresReleased: boolean;
}): boolean {
  if (params.scenarioCatalogScoresReleased) return false;
  if (params.isNewCraDraftFlow) return true;
  return catalogAssessmentStatusNeedsScoreMasking(params.catalogAssessmentStatus);
}

/** Per scenario: N/A and manually revealed rows always show full catalog scores. */
export function shouldMaskScenarioRowCatalogScores(
  scenarioId: string,
  params: {
    globalMask: boolean;
    scenarioNotApplicableIds: ReadonlySet<string>;
    scenarioManuallyRevealedScoreIds: ReadonlySet<string>;
  },
): boolean {
  if (!params.globalMask) return false;
  if (params.scenarioNotApplicableIds.has(scenarioId)) return false;
  if (params.scenarioManuallyRevealedScoreIds.has(scenarioId)) return false;
  return true;
}

/**
 * When not `null`, assessment navigation (`location.state`) explicitly controls whether catalog
 * scores appear (e.g. Scoring / Results tab before mock AI completes).
 */
export function catalogScoresVisibleFromAssessmentNavState(
  scenarioId: string | undefined,
  nav: {
    fromNewCraDraft?: boolean;
    scenarioCatalogScoresReleased?: boolean;
    scenarioManuallyRevealedScoreIds?: readonly string[];
  } | null
  | undefined,
): boolean | null {
  if (!scenarioId) return null;
  if (nav == null || typeof nav.fromNewCraDraft !== "boolean") return null;
  return (
    nav.scenarioCatalogScoresReleased === true ||
    (nav.scenarioManuallyRevealedScoreIds?.includes(scenarioId) ?? false)
  );
}

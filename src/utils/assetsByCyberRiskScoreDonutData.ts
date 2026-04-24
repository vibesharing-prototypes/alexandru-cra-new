import { assets } from "../data/assets.js";
import { cyberRisks } from "../data/cyberRisks.js";
import type { RagDataVizKey } from "../data/ragDataVisualization.js";
import { getCyberRiskScoreLabel, type FivePointScaleLabel } from "../data/types.js";

export type AssetCyberRiskDonutSegment = {
  range: string;
  label: string;
  count: number | null;
  colorKey: RagDataVizKey;
};

const BAND_SPEC: readonly {
  range: string;
  label: FivePointScaleLabel;
  colorKey: RagDataVizKey;
}[] = [
  { range: "101 - 125", label: "Very high", colorKey: "neg05" },
  { range: "76 - 100", label: "High", colorKey: "neg03" },
  { range: "51 - 75", label: "Medium", colorKey: "neu03" },
  { range: "26 - 50", label: "Low", colorKey: "pos04" },
  { range: "1 - 25", label: "Very low", colorKey: "pos05" },
] as const;

/**
 * For each in-scope asset, the worst (max) inherent cyber risk score across linked in-scope
 * risks determines the score band. Assets with no linked risk in scope are scored as
 * "Very low" (score 0) for bucketing.
 */
export function buildAssetCyberRiskDonutSegments(
  businessUnitId: string | null,
): AssetCyberRiskDonutSegment[] {
  const riskPool =
    businessUnitId == null
      ? cyberRisks
      : cyberRisks.filter((r) => r.businessUnitId === businessUnitId);

  const assetPool =
    businessUnitId == null
      ? assets
      : assets.filter((a) => a.businessUnitId === businessUnitId);

  const counts: Record<FivePointScaleLabel, number> = {
    "Very high": 0,
    High: 0,
    Medium: 0,
    Low: 0,
    "Very low": 0,
  };

  for (const asset of assetPool) {
    const related = riskPool.filter((r) => r.assetIds.includes(asset.id));
    const maxScore = related.length === 0 ? 0 : Math.max(...related.map((r) => r.cyberRiskScore));
    const label = getCyberRiskScoreLabel(maxScore);
    counts[label] += 1;
  }

  return BAND_SPEC.map((row) => ({
    range: row.range,
    label: row.label,
    colorKey: row.colorKey,
    count: counts[row.label],
  }));
}

/** Minimal row shape: same `cyberRiskScore.label` as assessment asset result rows / Assets grid. */
export type AssessmentAssetRowForDonut = {
  cyberRiskScore: { label: string };
};

/**
 * Donut bands for assessment results: counts assets by the grid’s cyber risk score label
 * (scenario-based when present, else criticality fallback).
 */
export function buildAssetCyberRiskDonutSegmentsFromAssessmentAssetRows(
  rows: readonly AssessmentAssetRowForDonut[],
): AssetCyberRiskDonutSegment[] {
  const counts: Record<FivePointScaleLabel, number> = {
    "Very high": 0,
    High: 0,
    Medium: 0,
    Low: 0,
    "Very low": 0,
  };
  for (const row of rows) {
    const lab = row.cyberRiskScore.label as FivePointScaleLabel;
    counts[lab] += 1;
  }
  return BAND_SPEC.map((row) => ({
    range: row.range,
    label: row.label,
    colorKey: row.colorKey,
    count: counts[row.label],
  }));
}

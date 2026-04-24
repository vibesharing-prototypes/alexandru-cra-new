import type { RiskHeatmapLevel } from "../data/ragDataVisualization.js";
import type { CyberRiskHeatmapScoreBasis } from "./cyberRiskMatrixAggregates.js";
import type { CyberRiskMatrixTableFilter, CyberRiskTableFilters } from "./cyberRiskTableRows.js";

const RISK_HEATMAP_LEVELS = new Set<RiskHeatmapLevel>([
  "veryHigh",
  "high",
  "medium",
  "low",
  "veryLow",
]);

const BASIS: readonly CyberRiskHeatmapScoreBasis[] = ["inherent", "residual"];

function isBasis(s: string): s is CyberRiskHeatmapScoreBasis {
  return (BASIS as readonly string[]).includes(s);
}

function parseInt0to4(s: string | null): number | null {
  if (s == null) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n) || n < 0 || n > 4) return null;
  return n;
}

const HEATMAP_PARAM_KEYS = ["heatmap", "basis", "row", "col", "level", "bu"] as const;

/** Removes only matrix-related search keys (keeps any unrelated params). */
export function stripMatrixParamsFromSearchParams(target: URLSearchParams): void {
  for (const k of HEATMAP_PARAM_KEYS) {
    target.delete(k);
  }
}

/**
 * Read matrix slice + business unit from `URLSearchParams`.
 * When heatmap params are missing or invalid, `matrixFilter` is `null` and `bu` is from `bu` or null.
 */
export function parseRiskHeatmapSearchParams(searchParams: URLSearchParams): Pick<
  CyberRiskTableFilters,
  "matrixFilter" | "businessUnitId"
> {
  const bu = searchParams.get("bu");
  const businessUnitId = bu && bu.length > 0 ? bu : null;

  const heatmap = searchParams.get("heatmap");
  if (heatmap !== "cell" && heatmap !== "legend") {
    return { matrixFilter: null, businessUnitId };
  }

  const basisStr = searchParams.get("basis");
  if (basisStr == null || !isBasis(basisStr)) {
    return { matrixFilter: null, businessUnitId };
  }
  const basis = basisStr;

  if (heatmap === "cell") {
    const row = parseInt0to4(searchParams.get("row"));
    const col = parseInt0to4(searchParams.get("col"));
    if (row == null || col == null) {
      return { matrixFilter: null, businessUnitId };
    }
    return {
      matrixFilter: { kind: "cell", basis, rowIdx: row, colIdx: col },
      businessUnitId,
    };
  }

  const levelStr = searchParams.get("level");
  if (levelStr == null || !RISK_HEATMAP_LEVELS.has(levelStr as RiskHeatmapLevel)) {
    return { matrixFilter: null, businessUnitId };
  }
  return {
    matrixFilter: { kind: "legend", basis, level: levelStr as RiskHeatmapLevel },
    businessUnitId,
  };
}

/** Replaces heatmap/bu URL keys with the given filter (or deletes them if both null / matrix null and no bu). */
export function applyMatrixFiltersToSearchParams(
  searchParams: URLSearchParams,
  next: Pick<CyberRiskTableFilters, "matrixFilter" | "businessUnitId">,
): void {
  stripMatrixParamsFromSearchParams(searchParams);

  const { matrixFilter, businessUnitId } = next;
  if (businessUnitId) {
    searchParams.set("bu", businessUnitId);
  }
  if (matrixFilter == null) {
    return;
  }
  if (matrixFilter.kind === "cell") {
    searchParams.set("heatmap", "cell");
    searchParams.set("basis", matrixFilter.basis);
    searchParams.set("row", String(matrixFilter.rowIdx));
    searchParams.set("col", String(matrixFilter.colIdx));
  } else {
    searchParams.set("heatmap", "legend");
    searchParams.set("basis", matrixFilter.basis);
    searchParams.set("level", matrixFilter.level);
  }
}

/**
 * @returns A query string (including `?` prefix when non-empty) for the cyber risks list route.
 */
export function buildMatrixQueryStringForRisksPage(
  matrixFilter: CyberRiskMatrixTableFilter,
  businessUnitId: string | null,
): string {
  const p = new URLSearchParams();
  const partial: Pick<CyberRiskTableFilters, "matrixFilter" | "businessUnitId"> = {
    matrixFilter,
    businessUnitId: businessUnitId ?? null,
  };
  applyMatrixFiltersToSearchParams(p, partial);
  const s = p.toString();
  return s.length > 0 ? `?${s}` : "";
}

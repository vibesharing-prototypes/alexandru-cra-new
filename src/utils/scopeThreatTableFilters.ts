import type { MockThreat } from "../data/types.js";
import { joinUserFullNames } from "../data/users.js";
import {
  applyThreatTableFilters,
  hasAnyThreatFilterSelected,
  type ThreatGridFilterRow,
  type ThreatTableFilters,
} from "./threatTableFilters.js";

/** Maps scoped / catalog threat rows to the shape used by [`FilterThreats`](../components/FilterThreats.tsx) and [`applyThreatTableFilters`](./threatTableFilters.ts). */
export function scopeThreatRowsToThreatFilterRows(
  rows: readonly MockThreat[],
): ThreatGridFilterRow[] {
  return rows.map((row) => {
    const ownerLabel = joinUserFullNames(row.ownerIds);
    return {
      id: row.id,
      name: row.name,
      threatDomain: row.domain,
      createdBy: ownerLabel,
      lastUpdatedBy: ownerLabel,
      aggregatedAssets: row.assetIds.length,
      vulnerabilities: row.vulnerabilityIds.length,
      assetIds: [...row.assetIds],
      vulnerabilityIds: [...row.vulnerabilityIds],
    };
  });
}

/** Union of asset ids linked from the given threat rows (for bounded filter options). */
export function unionScopeThreatLinkedAssetIds(rows: readonly MockThreat[]): string[] {
  const ids = new Set<string>();
  for (const r of rows) {
    for (const id of r.assetIds) ids.add(id);
  }
  return [...ids];
}

/** Union of vulnerability ids linked from the given threat rows (for bounded filter options). */
export function unionScopeThreatLinkedVulnerabilityIds(rows: readonly MockThreat[]): string[] {
  const ids = new Set<string>();
  for (const r of rows) {
    for (const id of r.vulnerabilityIds) ids.add(id);
  }
  return [...ids];
}

/** Keeps scope grid rows that satisfy `filters` (after caller applies inclusion view). */
export function filterScopeThreatRowsByThreatTableFilters<T extends MockThreat>(
  rows: readonly T[],
  filters: ThreatTableFilters,
): T[] {
  if (!hasAnyThreatFilterSelected(filters)) {
    return rows.slice();
  }
  const mapped = scopeThreatRowsToThreatFilterRows(rows);
  const matchedIds = new Set(applyThreatTableFilters(mapped, filters).map((r) => r.id));
  return rows.filter((r) => matchedIds.has(r.id));
}

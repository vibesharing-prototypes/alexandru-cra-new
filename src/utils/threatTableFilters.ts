/** Row fields used by [`FilterThreats`](../components/FilterThreats.tsx) and threat table filtering. */
export type ThreatGridFilterRow = {
  id: string;
  name: string;
  threatDomain: string;
  createdBy: string;
  lastUpdatedBy: string;
  aggregatedAssets: number;
  vulnerabilities: number;
  assetIds: string[];
  vulnerabilityIds: string[];
};

export type ThreatTableFilters = {
  sourceDomains: string[];
  createdByNames: string[];
  lastUpdatedByNames: string[];
  /** Threat must link to at least one of these assets when non-empty. */
  linkedAssetIds: string[];
  /** Threat must link to at least one of these vulnerabilities when non-empty. */
  linkedVulnerabilityIds: string[];
};

export const EMPTY_THREAT_TABLE_FILTERS: ThreatTableFilters = {
  sourceDomains: [],
  createdByNames: [],
  lastUpdatedByNames: [],
  linkedAssetIds: [],
  linkedVulnerabilityIds: [],
};

export function hasAnyThreatFilterSelected(f: ThreatTableFilters): boolean {
  return (
    f.sourceDomains.length > 0 ||
    f.createdByNames.length > 0 ||
    f.lastUpdatedByNames.length > 0 ||
    f.linkedAssetIds.length > 0 ||
    f.linkedVulnerabilityIds.length > 0
  );
}

function intersects(ids: string[], selected: Set<string>): boolean {
  return ids.some((id) => selected.has(id));
}

export function applyThreatTableFilters<T extends ThreatGridFilterRow>(
  rows: T[],
  filters: ThreatTableFilters,
): T[] {
  if (!hasAnyThreatFilterSelected(filters)) {
    return rows;
  }

  const domainSet =
    filters.sourceDomains.length > 0 ? new Set(filters.sourceDomains) : null;
  const createdSet =
    filters.createdByNames.length > 0 ? new Set(filters.createdByNames) : null;
  const updatedSet =
    filters.lastUpdatedByNames.length > 0 ? new Set(filters.lastUpdatedByNames) : null;
  const assetSet =
    filters.linkedAssetIds.length > 0 ? new Set(filters.linkedAssetIds) : null;
  const vulnSet =
    filters.linkedVulnerabilityIds.length > 0
      ? new Set(filters.linkedVulnerabilityIds)
      : null;

  return rows.filter((row) => {
    if (domainSet && !domainSet.has(row.threatDomain)) return false;
    if (createdSet && !createdSet.has(row.createdBy)) return false;
    if (updatedSet && !updatedSet.has(row.lastUpdatedBy)) return false;
    if (assetSet && !intersects(row.assetIds, assetSet)) return false;
    if (vulnSet && !intersects(row.vulnerabilityIds, vulnSet)) return false;
    return true;
  });
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Counts filter categories with any selection (for toolbar badge), aligned with [`ScopeToolbar`](./ScopeToolbar.tsx). */
export function countThreatFilterCriteria(filters: ThreatTableFilters): number {
  let n = 0;
  if (filters.sourceDomains.length > 0) n++;
  if (filters.createdByNames.length > 0) n++;
  if (filters.lastUpdatedByNames.length > 0) n++;
  if (filters.linkedAssetIds.length > 0) n++;
  if (filters.linkedVulnerabilityIds.length > 0) n++;
  return n;
}

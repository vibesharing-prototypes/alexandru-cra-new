import { cyberRisks } from "../data/cyberRisks.js";
import { threats } from "../data/threats.js";
import { vulnerabilities } from "../data/vulnerabilities.js";

export function includedAssetIdSet(rows: { included: boolean; assetId: string }[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    if (r.included) s.add(r.assetId);
  }
  return s;
}

export function scopedCyberRisks(assetIds: Set<string>) {
  if (assetIds.size === 0) return [];
  return cyberRisks.filter((cr) => cr.assetIds.some((aid) => assetIds.has(aid)));
}

export function scopedThreats(assetIds: Set<string>) {
  if (assetIds.size === 0) return [];
  return threats.filter((t) => t.assetIds.some((aid) => assetIds.has(aid)));
}

export function scopedVulnerabilities(assetIds: Set<string>) {
  if (assetIds.size === 0) return [];
  return vulnerabilities.filter((v) => v.assetIds.some((aid) => assetIds.has(aid)));
}

export const SCOPE_CATALOG_TOTALS = {
  cyberRisks: cyberRisks.length,
  threats: threats.length,
  vulnerabilities: vulnerabilities.length,
} as const;

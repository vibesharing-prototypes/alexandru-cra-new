import { padId } from "./types.js";
import type {
  MockThreat,
  ThreatSource,
  ThreatStatus,
  ControlFrequency,
  ThreatDomain,
  MockVulnerability,
  MockAsset,
} from "./types.js";
import { assets } from "./assets.js";
import { vulnerabilities } from "./vulnerabilities.js";

/**
 * Build one row per asset vulnerability chunk (80 rows), then merge rows that share the same `name` so
 * the catalog has no duplicate threat titles. Legacy sequential THR-### ids from the pre-merge build are
 * remapped via `remapThreatIdFromLegacySequential` for assessments.
 * Each merged threat unions vulnerabilities and assets from its former rows; `ownerId` is taken from the
 * first occurrence. `applyCrossEntityLinks` syncs asset ↔ vulnerability ↔ threat.
 */

type ThreatTemplate = {
  title: string;
  source: ThreatSource;
  status: ThreatStatus;
  controlFrequency: ControlFrequency;
  domain: ThreatDomain;
};

const THREAT_TEMPLATES: Record<MockAsset["assetType"], ThreatTemplate[]> = {
  Application: [
    {
      title: "Account takeover attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Automated credential attacks",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "API abuse and scraping",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
    {
      title: "Malware delivery via trusted channels",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
    {
      title: "Supply chain dependency compromise",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Supply Chain & Third Party",
    },
  ],
  Database: [
    {
      title: "Unauthorized data extraction",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Data & Information",
    },
    {
      title: "Privilege escalation via shared accounts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Ransomware encryption attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Data & Information",
    },
    {
      title: "Backup and replica exfiltration",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Data & Information",
    },
    {
      title: "SQL and query-layer exploitation",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
  ],
  Server: [
    {
      title: "Remote code execution attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Lateral movement via shared credentials",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Cryptojacking and resource abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Denial-of-service against hosted services",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Misconfiguration exploitation",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Cloud & Virtualisation",
    },
  ],
  "Network device": [
    {
      title: "Device firmware exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Network & Infrastructure",
    },
    {
      title: "Routing and control-plane manipulation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Network & Infrastructure",
    },
    {
      title: "Unauthorized configuration changes",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Traffic interception attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Recruitment of appliances into botnets",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Monthly",
      domain: "Network & Infrastructure",
    },
  ],
  "Cloud service": [
    {
      title: "IAM policy abuse and token theft",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Misconfiguration and public exposure exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "SaaS session hijacking",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Cloud metadata service abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Unauthorized workloads and cryptomining",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Cloud & Virtualisation",
    },
  ],
  Endpoint: [
    {
      title: "Endpoint malware deployment",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Endpoint & Device",
    },
    {
      title: "Credential theft from endpoints",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "USB and removable media borne attacks",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Endpoint & Device",
    },
    {
      title: "Lost or stolen device abuse",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "People & Workforce",
    },
    {
      title: "Local privilege escalation",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Weekly",
      domain: "Endpoint & Device",
    },
  ],
  "IoT device": [
    {
      title: "IoT botnet recruitment",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Weak default credential abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Firmware exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Sensor data interception",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Data & Information",
    },
    {
      title: "Physical tampering and side-channel access",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Quarterly",
      domain: "Physical & Facilities",
    },
  ],
};

/** Deterministic PRNG in [0, 1) for stable mock data across loads. */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Primary asset is always included; remaining slots are filled with distinct assets (deterministic shuffle).
 */
function pickAssetIdsForThreat(primaryAssetId: string, threatSeq: number): string[] {
  const maxAssets = assets.length;
  const rand = mulberry32(threatSeq * 1_000_003 + 49_297);
  const minCount = 2;
  const maxCount = Math.min(10, maxAssets);
  const targetCount = minCount + Math.floor(rand() * (maxCount - minCount + 1));

  const others = assets.map((a) => a.id).filter((id) => id !== primaryAssetId);
  const shuffled = [...others];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const extra = shuffled.slice(0, Math.max(0, targetCount - 1));
  return [primaryAssetId, ...extra];
}

function vulnsForAsset(assetId: string, all: MockVulnerability[]): MockVulnerability[] {
  return all.filter((v) => v.relationships.assetId === assetId);
}

/** Split asset vulnerabilities into 1–2 groups (2–3 items each) so total threats across catalog = 80. */
function chunkVulnerabilitiesForThreats(vulns: MockVulnerability[]): MockVulnerability[][] {
  const n = vulns.length;
  if (n === 0) return [];
  if (n <= 3) return [vulns];
  if (n === 4) return [vulns.slice(0, 2), vulns.slice(2, 4)];
  if (n === 5) return [vulns.slice(0, 3), vulns.slice(3, 5)];
  if (n === 6) return [vulns.slice(0, 3), vulns.slice(3, 6)];
  throw new Error(`Unexpected vulnerability count per asset: ${n}`);
}

function buildThreatRelationships(
  cyberRiskIds: string[],
  assetIds: string[],
  vulnerabilityIds: string[],
): MockThreat["relationships"] {
  return {
    assetIds,
    vulnerabilityIds,
    cyberRiskIds,
    controlIds: [],
    mitigationPlanIds: [],
    scenarioIds: [],
  };
}

function dedupePushId(arr: string[], id: string): void {
  if (!arr.includes(id)) arr.push(id);
}

/**
 * Collapse rows that share `name` into one threat (union of vulns and assets). Re-ids THR-001…THR-00N in
 * first-seen name order. Returns a map from each pre-merge threat id to the merged id.
 */
function mergeThreatsByName(rows: MockThreat[]): {
  merged: MockThreat[];
  oldIdToNewId: Map<string, string>;
} {
  const byName = new Map<string, MockThreat>();
  const nameOrder: string[] = [];

  for (const t of rows) {
    const existing = byName.get(t.name);
    if (!existing) {
      nameOrder.push(t.name);
      byName.set(t.name, {
        ...t,
        vulnerabilityIds: [...t.vulnerabilityIds],
        assetIds: [...t.assetIds],
        cyberRiskIds: [],
        relationships: buildThreatRelationships(
          [],
          [...t.assetIds],
          [...t.vulnerabilityIds],
        ),
      });
    } else {
      for (const vid of t.vulnerabilityIds) {
        dedupePushId(existing.vulnerabilityIds, vid);
        dedupePushId(existing.relationships.vulnerabilityIds, vid);
      }
      for (const aid of t.assetIds) {
        dedupePushId(existing.assetIds, aid);
        dedupePushId(existing.relationships.assetIds, aid);
      }
    }
  }

  const nameToNewId = new Map<string, string>();
  const merged: MockThreat[] = nameOrder.map((name, i) => {
    const src = byName.get(name)!;
    const newId = padId("THR", i + 1);
    nameToNewId.set(name, newId);
    return {
      ...src,
      id: newId,
      relationships: {
        ...src.relationships,
        assetIds: [...src.relationships.assetIds],
        vulnerabilityIds: [...src.relationships.vulnerabilityIds],
      },
    };
  });

  const oldIdToNewId = new Map<string, string>();
  for (const t of rows) {
    oldIdToNewId.set(t.id, nameToNewId.get(t.name)!);
  }

  return { merged, oldIdToNewId };
}

function buildThreats(): MockThreat[] {
  const out: MockThreat[] = [];
  let seq = 0;

  for (let assetIndex = 0; assetIndex < assets.length; assetIndex++) {
    const asset = assets[assetIndex]!;
    const pool = THREAT_TEMPLATES[asset.assetType];
    const assetVulns = vulnsForAsset(asset.id, vulnerabilities);
    const chunks = chunkVulnerabilitiesForThreats(assetVulns);

    chunks.forEach((chunk, chunkIndex) => {
      seq += 1;
      const template = pool[(assetIndex + chunkIndex) % pool.length]!;
      const vulnerabilityIds = chunk.map((v) => v.id);
      const assetIds = pickAssetIdsForThreat(asset.id, seq);
      const cyberRiskIds: string[] = [];

      out.push({
        id: padId("THR", seq),
        name: template.title,
        ownerId: asset.ownerId,
        source: template.source,
        status: template.status,
        controlFrequency: template.controlFrequency,
        domain: template.domain,
        cyberRiskIds,
        assetIds,
        vulnerabilityIds,
        relationships: buildThreatRelationships(cyberRiskIds, assetIds, vulnerabilityIds),
      });
    });
  }

  if (out.length !== 80) {
    throw new Error(`Expected 80 threats, got ${out.length}`);
  }

  return out;
}

const threatsUnmerged = buildThreats();
const { merged: threatsMerged, oldIdToNewId } = mergeThreatsByName(threatsUnmerged);

/** Maps legacy pre-dedupe THR-### (1…80) to the canonical merged threat id. */
export function remapThreatIdFromLegacySequential(legacyIndex: number): string {
  return oldIdToNewId.get(padId("THR", legacyIndex)) ?? padId("THR", legacyIndex);
}

function applyCrossEntityLinks(threatList: MockThreat[]): void {
  const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  for (const v of vulnerabilities) {
    v.threatIds.length = 0;
    v.relationships.threatIds.length = 0;
  }
  for (const a of assets) {
    a.vulnerabilityIds.length = 0;
    a.threatIds.length = 0;
    a.relationships.vulnerabilityIds.length = 0;
    a.relationships.threatIds.length = 0;
  }

  for (const v of vulnerabilities) {
    const a = assetById.get(v.relationships.assetId);
    if (a) {
      a.vulnerabilityIds.push(v.id);
      a.relationships.vulnerabilityIds.push(v.id);
    }
  }

  for (const t of threatList) {
    for (const vid of t.vulnerabilityIds) {
      const v = vulnById.get(vid);
      if (v && !v.threatIds.includes(t.id)) {
        v.threatIds.push(t.id);
        v.relationships.threatIds.push(t.id);
      }
    }
    for (const aid of t.assetIds) {
      const a = assetById.get(aid);
      if (a && !a.threatIds.includes(t.id)) {
        a.threatIds.push(t.id);
        a.relationships.threatIds.push(t.id);
      }
    }
  }
}

export const threats: MockThreat[] = threatsMerged;
applyCrossEntityLinks(threats);

const threatById = new Map(threats.map((t) => [t.id, t]));

export function getThreatById(id: string): MockThreat | undefined {
  return threatById.get(id);
}

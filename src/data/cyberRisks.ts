import {
  padId,
  getFivePointLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
} from "./types.js";
import type {
  MockCyberRisk,
  CyberRiskStatus,
  FivePointScaleValue,
} from "./types.js";
import { threats } from "./threats.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { assets } from "./assets.js";

const CONTROL_COUNT = 50;
const MITIGATION_PLAN_COUNT = 50;
const RISK_COUNT = 40;

const OWNER_ROTATION = [7, 9, 14, 15, 20, 33, 39, 49, 1, 5] as const;

/** Enterprise-style cyber risk statements (sentence case; acronyms kept uppercase). */
const RISK_SEEDS: { name: string; status: CyberRiskStatus }[] = [
  {
    name: "Ransomware and extortion disrupting critical operations and data availability",
    status: "Mitigation",
  },
  {
    name: "Phishing and impersonation compromising workforce and customer credentials",
    status: "Monitoring",
  },
  {
    name: "Denial-of-service events impairing service availability and revenue",
    status: "Assessment",
  },
  {
    name: "Insider actions or negligence leading to unauthorized data exfiltration",
    status: "Mitigation",
  },
  {
    name: "Business email compromise and payment fraud against the organization",
    status: "Monitoring",
  },
  {
    name: "Cyber incidents triggering regulatory non-compliance and enforcement action",
    status: "Assessment",
  },
  {
    name: "Supply chain compromise through vendors, software, or managed services",
    status: "Identification",
  },
  {
    name: "Application-layer attacks compromising confidentiality and integrity of data",
    status: "Mitigation",
  },
  {
    name: "Malware infection, illicit cryptomining, and lateral movement across systems",
    status: "Monitoring",
  },
  {
    name: "Account takeover enabling unauthorized access to systems and privileged functions",
    status: "Assessment",
  },
  {
    name: "Cloud or SaaS dependency failures causing extended operational outage",
    status: "Identification",
  },
  {
    name: "Sophisticated and AI-assisted cyber threats maintaining covert, long-term access",
    status: "Mitigation",
  },
  {
    name: "Exploitation of unpatched or zero-day vulnerabilities before remediations deploy",
    status: "Assessment",
  },
  {
    name: "Adversary-in-the-middle attacks intercepting or altering sensitive communications",
    status: "Monitoring",
  },
  {
    name: "Sophisticated cyber threats and AI-related security vulnerabilities",
    status: "Identification",
  },
  {
    name: "Credential stuffing and password reuse breaching customer or workforce accounts",
    status: "Mitigation",
  },
  {
    name: "Theft or leakage of trade secrets and competitively sensitive information",
    status: "Assessment",
  },
  {
    name: "Cyber incidents compromising confidential information and data subject privacy",
    status: "Monitoring",
  },
  {
    name: "Cyber resilience gap — IT infrastructure vulnerability exposure",
    status: "Assessment",
  },
  {
    name: "API abuse and excessive access undermining data protection and service integrity",
    status: "Identification",
  },
  {
    name: "Unauthorized data tampering affecting records, reporting, and auditability",
    status: "Mitigation",
  },
  {
    name: "Exploitation of delayed patching and legacy systems exposed to the internet",
    status: "Assessment",
  },
  {
    name: "Third-party or vendor breach exposing hosted, shared, or processed data",
    status: "Monitoring",
  },
  {
    name: "Public-facing defacement and reputational harm to brand and stakeholder trust",
    status: "Identification",
  },
  {
    name: "Cloud misconfiguration exposing storage, identities, or administrative paths",
    status: "Mitigation",
  },
  {
    name: "Double extortion combining encryption with threatened publication of stolen data",
    status: "Mitigation",
  },
  {
    name: "Prolonged technology outage exceeding recovery time and continuity tolerances",
    status: "Assessment",
  },
  {
    name: "Fraudulent data manipulation affecting transactions, analytics, or financial reporting",
    status: "Identification",
  },
  {
    name: "Targeted espionage against strategic plans, M&A, and intellectual property",
    status: "Assessment",
  },
  {
    name: "Regulatory and contractual penalties following security and privacy failures",
    status: "Monitoring",
  },
  {
    name: "Critical vendor or service disruption cascading into dependent business processes",
    status: "Mitigation",
  },
  {
    name: "Session hijacking and token theft enabling impersonation of legitimate users",
    status: "Assessment",
  },
  {
    name: "Customer PII exposure through breach, misdelivery, or inadequate safeguards",
    status: "Mitigation",
  },
  {
    name: "Security control or platform failure leaving assets temporarily undefended",
    status: "Identification",
  },
  {
    name: "Insecure API and integration design enabling data leakage or abuse",
    status: "Mitigation",
  },
  {
    name: "Cyber security breaches causing financial and reputational damage",
    status: "Assessment",
  },
  {
    name: "IoT and connected-device compromise expanding exposure into enterprise networks",
    status: "Assessment",
  },
  {
    name: "Malicious removable media and physical media vectors in sensitive environments",
    status: "Identification",
  },
  {
    name: "DNS hijacking or poisoning redirecting users, mail, or application traffic",
    status: "Monitoring",
  },
  {
    name: "SIM-swapping and telecom fraud circumventing SMS and voice-based authentication",
    status: "Identification",
  },
];

function dedupePush(arr: string[], id: string): void {
  if (!arr.includes(id)) arr.push(id);
}

function linkCyberRiskToEntities(risk: MockCyberRisk): void {
  const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));
  const threatById = new Map(threats.map((t) => [t.id, t]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  for (const tid of risk.threatIds) {
    const t = threatById.get(tid);
    if (t) dedupePush(t.cyberRiskIds, risk.id);
  }

  for (const vid of risk.vulnerabilityIds) {
    const v = vulnById.get(vid);
    if (v) dedupePush(v.cyberRiskIds, risk.id);
  }

  for (const aid of risk.assetIds) {
    const a = assetById.get(aid);
    if (a) dedupePush(a.relationships.cyberRiskIds, risk.id);
  }
}

function buildCyberRisks(): MockCyberRisk[] {
  const threatCount = threats.length;
  if (threatCount < 2) {
    throw new Error(`Need at least 2 threats to build ${RISK_COUNT} cyber risks`);
  }
  if (RISK_SEEDS.length !== RISK_COUNT) {
    throw new Error("RISK_SEEDS must match RISK_COUNT");
  }

  for (const v of vulnerabilities) {
    v.cyberRiskIds.length = 0;
  }
  for (const t of threats) {
    t.cyberRiskIds.length = 0;
  }
  for (const a of assets) {
    a.relationships.cyberRiskIds.length = 0;
  }

  const out: MockCyberRisk[] = [];

  for (let i = 0; i < RISK_COUNT; i++) {
    let i0 = (i * 2) % threatCount;
    let i1 = (i * 2 + 1) % threatCount;
    if (i1 === i0) {
      i1 = (i1 + 1) % threatCount;
    }
    const t0 = threats[i0]!;
    const t1 = threats[i1]!;
    const seed = RISK_SEEDS[i]!;

    const threatIds = [t0.id, t1.id];
    const assetSet = new Set<string>([...t0.assetIds, ...t1.assetIds]);
    const vulnSet = new Set<string>([...t0.vulnerabilityIds, ...t1.vulnerabilityIds]);

    const assetIds = Array.from(assetSet);
    const vulnerabilityIds = Array.from(vulnSet);
    const scenarioIds: string[] = [];

    const primaryAssetId = assetIds[0]!;
    const primaryAsset = assets.find((a) => a.id === primaryAssetId);
    const buIdx = primaryAsset
      ? Number(primaryAsset.businessUnitId.replace(/^BU-0*/, "") || "4")
      : 4;

    const ownerIdx = OWNER_ROTATION[i % OWNER_ROTATION.length]!;
    const impact = (2 + (i % 4)) as FivePointScaleValue;
    const likelihood = 6 + ((i * 5) % 20);
    const score = impact * likelihood;

    const ctlA = 1 + (i % CONTROL_COUNT);
    const ctlB = 1 + ((i + 11) % CONTROL_COUNT);
    const mpA = 1 + (i % MITIGATION_PLAN_COUNT);
    const mpB = 1 + ((i + 5) % MITIGATION_PLAN_COUNT);
    const controlIds = [padId("CTL", ctlA), padId("CTL", ctlB)];
    const mitigationPlanIds = [padId("MP", mpA), padId("MP", mpB)];

    const risk: MockCyberRisk = {
      id: padId("CR", i + 1),
      name: seed.name,
      ownerId: padId("USR", ownerIdx),
      status: seed.status,
      businessUnitId: padId("BU", buIdx),
      impact,
      impactLabel: getFivePointLabel(impact),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore: score,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(score),
      assetIds,
      threatIds,
      vulnerabilityIds,
      scenarioIds,
      controlIds,
      mitigationPlanIds,
      relationships: {
        assetIds,
        threatIds,
        vulnerabilityIds,
        scenarioIds,
        controlIds,
        mitigationPlanIds,
        assessmentIds: [],
      },
    };

    linkCyberRiskToEntities(risk);
    out.push(risk);
  }

  return out;
}

export const cyberRisks: MockCyberRisk[] = buildCyberRisks();

const riskById = new Map(cyberRisks.map((r) => [r.id, r]));

export function getCyberRiskById(id: string): MockCyberRisk | undefined {
  return riskById.get(id);
}

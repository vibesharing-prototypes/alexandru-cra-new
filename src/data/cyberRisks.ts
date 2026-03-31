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

type RiskRow = [
  name: string,
  status: CyberRiskStatus,
  ownerIdx: number,
  buIdx: number,
  impact: FivePointScaleValue,
  likelihood: number,
  assetIdxs: number[],
  threatIdxs: number[],
  vulnIdxs: number[],
  scenarioIdxs: number[],
  controlIdxs: number[],
  mitigationIdxs: number[],
];

const raw: RiskRow[] = [
  ["Ransomware attack", "Mitigation", 7, 15, 5, 22, [1, 2, 7], [1], [1, 10], [1, 2], [1, 9, 15, 29, 47], [1, 5]],
  ["Phishing campaign", "Monitoring", 9, 15, 4, 18, [3, 43], [2, 10], [3, 35], [3, 4], [8, 23, 38], [2, 10]],
  ["DDoS attack", "Assessment", 15, 4, 4, 16, [1, 11, 12], [4], [6, 11, 23, 27], [5, 6], [2, 3, 9, 29, 47], [3]],
  ["Insider data exfiltration", "Mitigation", 20, 10, 5, 15, [2, 17], [5], [7, 8, 26, 36], [7, 8], [5, 7, 11, 13, 31, 44], [4, 12]],
  ["Business email compromise", "Monitoring", 7, 2, 4, 20, [3, 16], [22, 50], [35], [9, 10], [8, 23, 41, 50], [6]],
  ["Regulatory non-compliance", "Assessment", 33, 9, 3, 8, [33, 16], [], [15], [], [33, 43], [7]],
  ["Supply chain compromise", "Identification", 9, 12, 4, 14, [24, 29, 28], [9], [19, 43, 45], [11, 12], [16, 32, 39], [8, 16]],
  ["SQL injection exploitation", "Mitigation", 14, 5, 5, 20, [13, 2], [3], [3, 47], [13, 14], [3, 6, 18, 19], [9, 17]],
  ["Malware infection", "Monitoring", 39, 4, 3, 12, [3, 39], [12, 19], [12, 37], [15, 16], [4, 10, 34, 37], [13]],
  ["Social media account takeover", "Assessment", 36, 6, 3, 10, [43, 21], [10, 38], [35, 44], [17, 18], [8, 25], [10]],
  ["Cloud service outage", "Identification", 29, 4, 4, 12, [8, 29, 50], [23], [32, 48], [19, 20], [20, 40], [18]],
  ["Advanced persistent threat", "Mitigation", 14, 15, 5, 24, [2, 28], [13], [8, 9, 15], [21, 22], [2, 7, 14, 29, 45, 47], [14, 20]],
  ["Zero-day exploit", "Assessment", 14, 5, 5, 18, [9, 28], [8], [19, 37], [23, 24], [6, 10, 37, 45], [15]],
  ["Man-in-the-middle attack", "Monitoring", 6, 4, 4, 12, [6, 13], [6], [5, 17], [25, 26], [5, 24, 30], [19]],
  ["Cryptojacking", "Identification", 15, 4, 2, 8, [29, 8], [20], [46], [27], [20, 40], [21]],
  ["Credential stuffing attack", "Mitigation", 7, 15, 4, 16, [7, 14], [7, 11], [2, 4, 30], [28, 29], [1, 25, 30], [22]],
  ["Trade secret exposure", "Assessment", 5, 5, 5, 14, [2, 17, 28], [5], [7, 36], [30], [5, 7, 11, 31], [23]],
  ["Compliance breach", "Monitoring", 33, 9, 3, 6, [33, 7], [], [8, 15], [], [13, 33, 43], [24]],
  ["Infrastructure zero-day damage", "Assessment", 14, 4, 5, 20, [9, 36, 28], [8, 25], [19, 37], [31, 32], [6, 10, 37], [15, 25]],
  ["API abuse incident", "Identification", 13, 5, 3, 14, [13, 18], [24, 47], [13, 23], [33, 34], [22], [26]],
  ["Data integrity compromise", "Mitigation", 6, 4, 4, 18, [6, 13], [6], [5, 17], [25, 26], [5, 24, 30], [19]],
  ["Patch management failure", "Assessment", 39, 4, 3, 12, [39, 38], [12], [12, 37], [35], [4, 10, 34], [27]],
  ["Third-party data breach", "Monitoring", 9, 12, 4, 16, [24, 4], [36, 9], [19, 43], [36, 37], [16, 39], [28]],
  ["Website defacement", "Identification", 27, 6, 2, 10, [21, 19], [15, 18], [18, 21], [38], [3, 6, 18], [29]],
  ["Cloud misconfiguration breach", "Mitigation", 29, 14, 4, 16, [8, 29], [23], [25, 32, 48], [39, 40], [20, 21, 40], [30]],
  ["Ransomware double extortion", "Mitigation", 7, 15, 5, 25, [2, 40, 6], [1, 49], [1, 5, 40], [41, 42], [1, 9, 24, 49], [31, 5]],
  ["Prolonged service outage", "Assessment", 10, 4, 4, 14, [50, 10, 12], [4, 30], [14, 6], [43], [12, 28, 48], [32]],
  ["Data manipulation attack", "Identification", 7, 15, 4, 16, [7, 2], [16], [8, 26], [44], [7, 13, 25], [33]],
  ["Competitive espionage", "Assessment", 14, 16, 5, 18, [28, 17, 25], [13], [7, 8, 9], [45], [7, 14, 45, 47], [34]],
  ["GDPR data breach fine", "Monitoring", 33, 3, 5, 20, [2, 3], [], [35], [46], [8, 11, 31, 43], [35]],
  ["Vendor supply chain disruption", "Mitigation", 9, 12, 4, 14, [24, 4], [36, 9], [19, 43], [36, 37], [16, 39], [28, 36]],
  ["Session hijacking fraud", "Assessment", 9, 2, 3, 12, [1, 21], [17], [20, 24], [47], [22, 25, 30], [37]],
  ["Customer data exposure", "Mitigation", 7, 8, 5, 22, [2, 26, 45], [1, 2], [35, 3], [48, 49], [1, 8, 11, 23], [38, 2]],
  ["IT system failure", "Identification", 20, 4, 3, 10, [10, 50], [30, 34], [14, 42], [50], [12, 28, 48], [39]],
  ["Insecure API exploitation", "Mitigation", 13, 5, 4, 16, [13, 18], [24, 47], [13, 23, 29], [33, 34], [22, 6], [26, 40]],
  ["Business continuity threat", "Assessment", 20, 4, 4, 14, [50, 10], [30, 33], [14, 34, 42], [50], [12, 26, 28, 48], [39, 41]],
  ["Data backup recovery failure", "Identification", 10, 4, 3, 8, [10, 50], [30], [14], [], [12, 28], [42]],
  ["IoT device compromise", "Assessment", 48, 4, 3, 12, [37, 48], [40, 27], [10, 50], [51], [2, 27], [43]],
  ["USB-based intrusion", "Identification", 36, 20, 2, 6, [39, 34], [21], [50], [], [4, 26, 27], [44]],
  ["Cross-site scripting exploitation", "Mitigation", 27, 5, 3, 15, [21, 13], [15], [18, 21], [38], [3, 6, 18], [29, 45]],
  ["DNS hijacking", "Monitoring", 15, 4, 4, 16, [11, 21], [14, 37], [33], [52], [35], [46]],
  ["Social engineering fraud", "Assessment", 36, 6, 3, 14, [43, 3], [10, 39], [35], [17, 18], [8, 25, 50], [10, 47]],
  ["Keylogger data theft", "Identification", 39, 15, 3, 10, [39, 34], [42], [12, 39, 50], [], [4, 34], [48]],
  ["Compliance logging gap", "Assessment", 33, 9, 3, 8, [20, 49], [], [15], [], [14, 33], [24, 49]],
  ["Mobile device breach", "Identification", 39, 4, 3, 10, [39, 37], [27, 41], [38, 50], [], [27, 30, 36], [43]],
  ["Firmware attack", "Draft", 48, 4, 3, 12, [36, 37], [27], [50], [], [2, 37], [50]],
  ["Application downtime", "Monitoring", 20, 4, 4, 14, [29, 8], [45], [41, 46], [19, 20], [10, 17, 20], [18, 32]],
  ["Privacy mishandling breach", "Assessment", 9, 3, 4, 16, [2, 35], [5], [35, 36], [30, 46], [8, 11, 31, 44], [35, 23]],
  ["Container escape breach", "Identification", 29, 5, 4, 14, [29], [46], [31, 46], [], [17, 20, 21, 37], [30]],
  ["Deepfake impersonation fraud", "Draft", 7, 2, 3, 12, [43, 23], [39], [35], [], [8, 41, 50], [6, 47]],
  ["SIM swapping fraud", "Identification", 9, 15, 3, 14, [3, 14], [50], [2, 35], [], [1, 23, 41], [22, 10]],
];

export const cyberRisks: MockCyberRisk[] = raw.map(
  (
    [name, status, ownerIdx, buIdx, impact, likelihood, assetIdxs, threatIdxs, vulnIdxs, scenarioIdxs, controlIdxs, mitigationIdxs],
    i,
  ) => {
    const score = impact * likelihood;
    return {
      id: padId("CR", i + 1),
      name,
      ownerId: padId("USR", ownerIdx),
      status,
      businessUnitId: padId("BU", buIdx),
      impact,
      impactLabel: getFivePointLabel(impact),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore: score,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(score),
      assetIds: assetIdxs.map((n) => padId("AST", n)),
      threatIds: threatIdxs.map((n) => padId("THR", n)),
      vulnerabilityIds: vulnIdxs.map((n) => padId("VUL", n)),
      scenarioIds: scenarioIdxs.map((n) => padId("SC", n)),
      controlIds: controlIdxs.map((n) => padId("CTL", n)),
      mitigationPlanIds: mitigationIdxs.map((n) => padId("MP", n)),
    };
  },
);

const riskById = new Map(cyberRisks.map((r) => [r.id, r]));

export function getCyberRiskById(id: string): MockCyberRisk | undefined {
  return riskById.get(id);
}

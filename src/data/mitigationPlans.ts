import { padId, getFivePointLabel } from "./types.js";
import type {
  MockMitigationPlan,
  MitigationPlanStatus,
  FivePointScaleValue,
} from "./types.js";

type PlanRow = [
  name: string,
  ownerIdx: number,
  status: MitigationPlanStatus,
  dueDate: string,
  buIdx: number,
  severity: FivePointScaleValue,
  ctlIdxs: number[],
  crIdxs: number[],
  craIdxs: number[],
];

const raw: PlanRow[] = [
  ["Ransomware recovery enhancement", 7, "In progress", "2026-06-30", 15, 5, [1, 9, 15], [1], [1, 31]],
  ["Phishing defense improvement program", 9, "In progress", "2026-05-31", 15, 4, [8, 23], [2, 33], [2, 17, 23]],
  ["DDoS mitigation deployment", 15, "In progress", "2026-04-30", 4, 4, [2, 3, 9], [3], [7, 34]],
  ["Insider threat prevention program", 20, "In progress", "2026-07-31", 10, 5, [5, 7, 11], [4], [6, 26]],
  ["Ransomware double extortion response", 7, "In progress", "2026-06-15", 15, 5, [1, 9, 24, 49], [1, 26], [1, 31]],
  ["BEC awareness and controls", 7, "Completed", "2025-12-31", 2, 4, [8, 23, 50], [5, 50], [17, 23]],
  ["Regulatory compliance remediation", 33, "In progress", "2026-09-30", 9, 3, [33, 43], [6], [19, 30]],
  ["Supply chain risk reduction", 9, "In progress", "2026-08-31", 12, 4, [16, 32, 39], [7], [5, 14]],
  ["SQL injection remediation sprint", 14, "Completed", "2026-02-28", 5, 5, [3, 6, 18, 19], [8], [2, 8, 27]],
  ["Social engineering resilience plan", 36, "In progress", "2026-06-30", 6, 3, [8, 25], [2, 10, 50], [23, 41]],
  ["Cloud security hardening", 29, "In progress", "2026-05-31", 4, 4, [20, 40], [11], [4, 28]],
  ["Data exfiltration prevention", 20, "In progress", "2026-08-31", 10, 5, [5, 7, 11, 31], [4], [6, 26]],
  ["Malware defense upgrade", 39, "Completed", "2026-01-31", 4, 3, [4, 10, 34, 37], [9], [11, 43]],
  ["APT detection and response program", 14, "In progress", "2026-09-30", 15, 5, [2, 7, 14, 29, 45, 47], [12], [2, 37]],
  ["Zero-day preparedness plan", 14, "In progress", "2026-07-31", 5, 5, [6, 10, 37, 45], [13, 19], [2, 15]],
  ["Supply chain vendor controls", 9, "In progress", "2026-08-31", 12, 4, [16, 39], [7, 31], [5, 14]],
  ["Database security enhancement", 17, "Completed", "2026-03-15", 5, 5, [3, 19], [8], [13]],
  ["Cloud outage resilience plan", 29, "In progress", "2026-06-30", 4, 4, [12, 20, 28], [11, 47], [4, 10, 24]],
  ["MitM attack prevention", 6, "Completed", "2026-01-15", 4, 4, [5, 24, 30], [14, 21], [7, 25]],
  ["APT monitoring expansion", 14, "In progress", "2026-10-31", 15, 5, [7, 14, 45, 47], [12], [2, 37, 47]],
  ["Cryptojacking detection deployment", 15, "In progress", "2026-04-30", 4, 2, [20, 40], [15], [4]],
  ["Credential security hardening", 7, "In progress", "2026-05-31", 15, 4, [1, 25, 30], [16, 50], [12, 29]],
  ["Trade secret protection program", 5, "In progress", "2026-09-30", 5, 5, [5, 7, 11, 31], [17, 48], [6, 26]],
  ["Compliance monitoring automation", 33, "In progress", "2026-07-31", 9, 3, [13, 33, 43], [6, 18, 44], [19, 30]],
  ["Infrastructure hardening sprint", 14, "Completed", "2026-03-31", 4, 5, [6, 10, 37], [19], [15]],
  ["API security gateway deployment", 13, "In progress", "2026-05-15", 5, 4, [6, 22], [20, 35], [8, 16, 21]],
  ["Patch management acceleration", 39, "In progress", "2026-04-30", 4, 3, [4, 10, 34], [22], [11, 43]],
  ["Vendor breach response plan", 9, "In progress", "2026-06-30", 12, 4, [16, 39], [23, 31], [5]],
  ["Web application hardening", 27, "Completed", "2026-02-15", 6, 2, [3, 6, 18], [24, 40], [8, 27]],
  ["Cloud misconfiguration remediation", 29, "In progress", "2026-05-31", 14, 4, [20, 21, 40], [25], [4, 28]],
  ["Encryption upgrade program", 40, "In progress", "2026-07-31", 15, 5, [1, 9, 24, 49], [26], [1, 25]],
  ["Service availability improvement", 10, "In progress", "2026-06-30", 4, 4, [12, 28, 48], [27], [10, 24]],
  ["Privileged access tightening", 7, "In progress", "2026-05-31", 15, 4, [7, 13, 25], [28], [12, 42]],
  ["Competitive intelligence protection", 14, "In progress", "2026-09-30", 16, 5, [7, 14, 45, 47], [29], [26]],
  ["GDPR breach response plan", 33, "Completed", "2026-01-31", 3, 5, [8, 11, 31, 43], [30, 48], [30, 33]],
  ["Supply chain audit program", 9, "In progress", "2026-08-31", 12, 4, [16, 39], [7, 31], [5, 14]],
  ["Session security upgrade", 9, "In progress", "2026-04-30", 2, 3, [22, 25, 30], [32], [49]],
  ["Customer data encryption program", 7, "In progress", "2026-07-31", 8, 5, [1, 8, 11, 23], [33], [33]],
  ["Business continuity enhancement", 20, "In progress", "2026-08-31", 4, 4, [12, 26, 28, 48], [34, 36], [10, 24]],
  ["API rate limiting deployment", 13, "Completed", "2026-03-15", 5, 3, [22], [20, 35], [16, 21]],
  ["Disaster recovery improvement", 10, "In progress", "2026-09-30", 4, 4, [12, 28, 48], [36], [24, 39]],
  ["Data backup modernization", 10, "In progress", "2026-06-30", 4, 3, [12, 28], [37], [39]],
  ["IoT security controls", 48, "In progress", "2026-07-31", 4, 3, [2, 27], [38], [35]],
  ["USB threat mitigation", 36, "Completed", "2026-02-28", 20, 2, [4, 26, 27], [39], [36]],
  ["XSS remediation campaign", 27, "Completed", "2026-02-28", 5, 3, [3, 6, 18], [40], [8, 27]],
  ["DNS security enhancement", 15, "In progress", "2026-04-30", 4, 4, [35], [41], [7, 34, 48]],
  ["Deepfake awareness program", 7, "In progress", "2026-08-31", 2, 3, [8, 41, 50], [50], [23, 41]],
  ["Keylogger defense deployment", 39, "In progress", "2026-05-15", 15, 3, [4, 34], [42], [11]],
  ["Compliance logging improvement", 33, "In progress", "2026-06-30", 9, 3, [14, 33], [44], [19, 47]],
  ["Firmware integrity program", 48, "In progress", "2026-07-31", 4, 3, [2, 37], [46], [35, 38]],
];

export const mitigationPlans: MockMitigationPlan[] = raw.map(
  ([name, ownerIdx, status, dueDate, buIdx, severity, ctlIdxs, crIdxs, craIdxs], i) => ({
    id: padId("MP", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    status,
    dueDate,
    businessUnitId: padId("BU", buIdx),
    severity,
    severityLabel: getFivePointLabel(severity),
    controlIds: ctlIdxs.map((n) => padId("CTL", n)),
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
    assessmentIds: craIdxs.map((n) => padId("CRA", n)),
  }),
);

const planById = new Map(mitigationPlans.map((p) => [p.id, p]));

export function getMitigationPlanById(
  id: string,
): MockMitigationPlan | undefined {
  return planById.get(id);
}

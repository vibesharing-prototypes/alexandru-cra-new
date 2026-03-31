import { padId } from "./types.js";
import type {
  MockVulnerability,
  VulnerabilityDomain,
  VulnerabilityStatus,
  CIAImpact,
} from "./types.js";

type VulnRow = [
  name: string,
  domain: VulnerabilityDomain,
  status: VulnerabilityStatus,
  cia: CIAImpact,
  ownerIdx: number,
  crIdxs: number[],
  astIdxs: number[],
  thrIdxs: number[],
];

const raw: VulnRow[] = [
  ["Unpatched web server", "Technology", "Active", "Availability", 7, [1], [1, 9], [1]],
  ["Missing multi-factor authentication", "Technology", "Active", "Confidentiality", 9, [1, 16], [7, 14], [7, 11]],
  ["SQL injection vulnerability", "Technology", "Active", "Integrity", 14, [8, 2], [13, 2], [3, 15]],
  ["Weak password policy", "People", "Active", "Confidentiality", 15, [16, 42], [7, 14], [7, 11]],
  ["Outdated SSL/TLS configuration", "Technology", "Active", "Confidentiality", 40, [26, 14], [6, 40], [6, 49]],
  ["Open network ports", "Technology", "Active", "Availability", 48, [3, 47], [36, 11], [4, 35]],
  ["Missing data encryption at rest", "Technology", "Active", "Confidentiality", 7, [4], [2, 17], [5, 13]],
  ["Insufficient access controls", "Process", "Active", "Confidentiality", 9, [4, 28], [7, 2], [5, 16]],
  ["Unmonitored privileged accounts", "Process", "Active", "Integrity", 20, [12], [7, 14], [13]],
  ["Lack of network segmentation", "Technology", "Active", "Availability", 15, [1, 38], [36, 12], [1, 40]],
  ["Missing intrusion detection system", "Technology", "Active", "Availability", 49, [3], [36, 9], [4]],
  ["Outdated antivirus signatures", "Technology", "Active", "Integrity", 39, [9, 38], [39, 3], [12, 19]],
  ["Insecure API endpoints", "Technology", "Active", "Confidentiality", 13, [35, 20], [13, 18], [24, 47]],
  ["Missing backup verification", "Process", "Active", "Availability", 10, [47, 37], [10, 50], [30]],
  ["Insufficient logging and monitoring", "Process", "Active", "Integrity", 49, [12, 44], [20, 49], [13]],
  ["Default administrator credentials", "People", "Active", "Confidentiality", 7, [16], [37, 38], [7]],
  ["Unencrypted data in transit", "Technology", "Active", "Confidentiality", 6, [21, 14], [6, 13], [6]],
  ["Missing security headers", "Technology", "Active", "Integrity", 27, [40], [21, 19], [15]],
  ["Vulnerable third-party libraries", "Technology", "Active", "Integrity", 28, [7, 19], [28, 27], [8, 9, 36]],
  ["Inadequate session management", "Technology", "Active", "Confidentiality", 9, [32, 35], [1, 21], [17, 48]],
  ["Cross-site scripting flaw", "Technology", "Active", "Integrity", 27, [40], [21, 13], [15]],
  ["Insecure file upload handling", "Technology", "Active", "Integrity", 14, [9], [19, 35], [12]],
  ["Missing rate limiting", "Technology", "Active", "Availability", 13, [3, 20], [13, 1], [4, 24]],
  ["Improper error handling", "Technology", "Active", "Confidentiality", 27, [32, 8], [13, 21], [17, 3]],
  ["Hardcoded credentials in source code", "Technology", "Active", "Confidentiality", 28, [25], [28, 27], [23]],
  ["Excessive user permissions", "Process", "Active", "Confidentiality", 7, [4, 28], [7, 2], [5, 16]],
  ["Missing web application firewall", "Technology", "Active", "Availability", 9, [3, 8], [21, 1], [4, 3]],
  ["Insecure deserialization", "Technology", "Draft", "Integrity", 14, [19], [13, 18], [8]],
  ["Server-side request forgery", "Technology", "Active", "Confidentiality", 27, [35], [13, 29], [24]],
  ["Broken authentication flow", "Technology", "Active", "Confidentiality", 9, [16, 32], [14, 21], [7, 17]],
  ["Missing container image scanning", "Technology", "Active", "Integrity", 29, [49, 25], [29, 27], [46, 23]],
  ["Unrestricted cloud storage bucket", "Technology", "Active", "Confidentiality", 8, [25, 11], [8], [23]],
  ["Missing DNS security extensions", "Technology", "Active", "Availability", 15, [41, 33], [11], [14, 37]],
  ["Inadequate physical access controls", "Physical", "Active", "Availability", 38, [29, 36], [36, 10], [29, 31]],
  ["Insufficient employee security training", "People", "Active", "Confidentiality", 1, [2, 10, 50], [3, 43], [2, 10, 22]],
  ["Missing data loss prevention controls", "Process", "Active", "Confidentiality", 9, [4, 17], [2, 35], [5]],
  ["Outdated operating system", "Technology", "Active", "Availability", 39, [9, 19], [39, 38], [12, 8]],
  ["Insecure remote access configuration", "Technology", "Active", "Confidentiality", 6, [16, 45], [6, 37], [7, 28]],
  ["Missing endpoint detection and response", "Technology", "Active", "Integrity", 39, [9, 42], [39, 34], [12, 42]],
  ["Weak encryption algorithms", "Technology", "Active", "Confidentiality", 40, [26, 14], [40, 6], [49, 6]],
  ["Insufficient change management controls", "Process", "Active", "Integrity", 20, [47, 25], [29, 8], [45]],
  ["Missing security incident response plan", "Process", "Draft", "Availability", 49, [36], [50, 49], [30, 33]],
  ["Inadequate vendor risk assessment", "Process", "Active", "Integrity", 9, [23, 31], [24, 4], [36, 9]],
  ["Unvalidated redirects and forwards", "Technology", "Active", "Integrity", 27, [10, 40], [21, 19], [10, 18]],
  ["Missing code signing verification", "Technology", "Draft", "Integrity", 28, [7, 46], [28, 27], [9, 27]],
  ["Insecure container runtime", "Technology", "Active", "Availability", 29, [49], [29], [46]],
  ["Insufficient database access controls", "Technology", "Active", "Confidentiality", 17, [8, 4], [2, 17], [3, 5]],
  ["Missing cloud workload protection", "Technology", "Active", "Availability", 29, [11, 25], [8, 29], [23]],
  ["Inadequate key management practices", "Process", "Active", "Confidentiality", 40, [26], [40, 14], [49, 26]],
  ["Unprotected management interfaces", "Technology", "Active", "Confidentiality", 48, [38, 45], [48, 37], [40, 41]],
];

export const vulnerabilities: MockVulnerability[] = raw.map(
  ([name, domain, status, primaryCIAImpact, ownerIdx, crIdxs, astIdxs, thrIdxs], i) => ({
    id: padId("VUL", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    domain,
    status,
    primaryCIAImpact,
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
    assetIds: astIdxs.map((n) => padId("AST", n)),
    threatIds: thrIdxs.map((n) => padId("THR", n)),
  }),
);

const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));

export function getVulnerabilityById(id: string): MockVulnerability | undefined {
  return vulnById.get(id);
}

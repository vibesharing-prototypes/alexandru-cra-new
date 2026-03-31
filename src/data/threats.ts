import { padId } from "./types.js";
import type {
  MockThreat,
  ThreatSource,
  ThreatStatus,
  ControlFrequency,
} from "./types.js";

type ThreatRow = [
  name: string,
  source: ThreatSource,
  status: ThreatStatus,
  freq: ControlFrequency,
  ownerIdx: number,
  cyberRiskIdxs: number[],
  assetIdxs: number[],
  vulnIdxs: number[],
];

const raw: ThreatRow[] = [
  ["Ransomware attack", "Deliberate", "Active", "Daily", 7, [1, 26], [1, 2, 7], [1, 2]],
  ["Phishing campaign", "Deliberate", "Active", "Daily", 9, [2, 5], [3, 43], [3, 35]],
  ["SQL injection attack", "Deliberate", "Active", "Weekly", 14, [8, 40], [13, 2], [3, 47]],
  ["DDoS attack", "Deliberate", "Active", "Daily", 15, [3, 47], [1, 11, 12], [6, 23]],
  ["Insider data exfiltration", "Deliberate", "Active", "Monthly", 20, [4, 17], [2, 17], [8, 26]],
  ["Man-in-the-middle attack", "Deliberate", "Active", "Weekly", 7, [21, 14], [6, 13], [5, 17]],
  ["Brute force attack", "Deliberate", "Active", "Daily", 9, [16, 42], [7, 14], [4, 2]],
  ["Zero-day exploit", "Deliberate", "Active", "Weekly", 14, [19, 13], [9, 28], [19, 37]],
  ["Supply chain compromise", "Deliberate", "Active", "Monthly", 20, [7, 31], [24, 29], [19, 43]],
  ["Social engineering attack", "Deliberate", "Active", "Weekly", 36, [10, 42], [43, 3], [35, 3]],
  ["Credential stuffing", "Deliberate", "Active", "Daily", 7, [16], [7, 14], [2, 4]],
  ["Malware infection", "Deliberate", "Active", "Daily", 39, [9, 38], [3, 39], [12, 37]],
  ["Advanced persistent threat", "Deliberate", "Active", "Weekly", 14, [12, 29], [2, 28], [8, 15]],
  ["DNS spoofing", "Deliberate", "Active", "Weekly", 15, [41], [11], [33]],
  ["Cross-site scripting attack", "Deliberate", "Active", "Weekly", 27, [40], [21, 13], [18, 21]],
  ["Privilege escalation", "Deliberate", "Active", "Monthly", 7, [28], [7, 14], [8, 26]],
  ["Session hijacking", "Deliberate", "Active", "Weekly", 9, [32], [1, 21], [20, 24]],
  ["Watering hole attack", "Deliberate", "Active", "Monthly", 14, [37], [19, 22], [19, 44]],
  ["Drive-by download", "Deliberate", "Active", "Weekly", 39, [36], [3, 39], [12, 19]],
  ["Cryptojacking", "Deliberate", "Active", "Daily", 15, [15], [29, 8], [46]],
  ["USB-based attack", "Deliberate", "Active", "Monthly", 36, [39], [39, 34], [50]],
  ["Business email compromise", "Deliberate", "Active", "Daily", 7, [5, 50], [3, 16], [35, 3]],
  ["Cloud misconfiguration exploitation", "Deliberate", "Active", "Weekly", 29, [25, 11], [8, 29], [32, 48]],
  ["API abuse", "Deliberate", "Active", "Weekly", 13, [35, 20], [13, 18], [13, 23]],
  ["Memory corruption exploit", "Deliberate", "Active", "Monthly", 14, [19], [7, 14], [37, 40]],
  ["Side-channel attack", "Deliberate", "Draft", "Quarterly", 40, [29], [40, 14], [40, 49]],
  ["Firmware tampering", "Deliberate", "Active", "Quarterly", 48, [46], [36, 37], [50]],
  ["Rogue wireless access point", "Deliberate", "Active", "Monthly", 37, [45], [37], [36]],
  ["Physical intrusion", "Deliberate", "Active", "Monthly", 36, [29], [36, 10], [34]],
  ["Power grid failure", "Environmental", "Active", "Quarterly", 20, [34, 47], [10, 50], [42]],
  ["Flooding event", "Environmental", "Active", "Annually", 38, [36], [10, 50], [34]],
  ["Earthquake disruption", "Environmental", "Draft", "Annually", 20, [36], [50], [34]],
  ["Data center fire", "Environmental", "Active", "Quarterly", 38, [36], [10, 50], [42]],
  ["HVAC system failure", "Environmental", "Active", "Quarterly", 20, [34], [10], [42]],
  ["Network cable cut", "Environmental", "Active", "Monthly", 48, [47], [12, 36], [6]],
  ["Third-party vendor breach", "Deliberate", "Active", "Monthly", 9, [23, 31], [24, 4], [43, 19]],
  ["Domain hijacking", "Deliberate", "Active", "Weekly", 15, [33, 41], [11, 21], [33]],
  ["Typosquatting attack", "Deliberate", "Active", "Monthly", 36, [10], [21, 43], [35]],
  ["Deepfake impersonation", "Deliberate", "Draft", "Quarterly", 7, [50], [43, 23], [35]],
  ["IoT botnet attack", "Deliberate", "Active", "Weekly", 48, [38], [37, 48], [50]],
  ["Bluetooth exploitation", "Deliberate", "Draft", "Quarterly", 37, [45], [37, 39], [36]],
  ["Keylogger deployment", "Deliberate", "Active", "Weekly", 39, [42], [39, 34], [12, 50]],
  ["Data poisoning attack", "Deliberate", "Draft", "Monthly", 14, [31], [25, 17], [19]],
  ["Model extraction attack", "Deliberate", "Draft", "Quarterly", 13, [35], [25, 31], [13]],
  ["Configuration drift", "Accidental", "Active", "Weekly", 29, [47, 25], [29, 8], [46, 41]],
  ["Container escape attack", "Deliberate", "Active", "Weekly", 27, [49], [29], [46, 31]],
  ["Serverless function abuse", "Deliberate", "Active", "Monthly", 13, [35], [18, 30], [13, 23]],
  ["OAuth token theft", "Deliberate", "Active", "Weekly", 7, [16, 48], [13, 14], [20, 2]],
  ["Certificate spoofing", "Deliberate", "Active", "Monthly", 40, [26], [40, 6], [24, 5]],
  ["SIM swapping attack", "Deliberate", "Active", "Monthly", 9, [50, 5], [3, 14], [2, 35]],
];

export const threats: MockThreat[] = raw.map(
  ([name, source, status, controlFrequency, ownerIdx, crIdxs, astIdxs, vulnIdxs], i) => ({
    id: padId("THR", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    source,
    status,
    controlFrequency,
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
    assetIds: astIdxs.map((n) => padId("AST", n)),
    vulnerabilityIds: vulnIdxs.map((n) => padId("VUL", n)),
  }),
);

const threatById = new Map(threats.map((t) => [t.id, t]));

export function getThreatById(id: string): MockThreat | undefined {
  return threatById.get(id);
}

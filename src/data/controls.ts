import { padId } from "./types.js";
import type {
  MockControl,
  ControlStatus,
  ControlType,
  ControlFrequency,
} from "./types.js";

type ControlRow = [
  name: string,
  status: ControlStatus,
  controlType: ControlType,
  keyControl: boolean,
  freq: ControlFrequency,
  ownerIdx: number,
  crIdxs: number[],
];

const raw: ControlRow[] = [
  ["Multi-factor authentication enforcement", "Active", "Preventive", true, "Daily", 7, [1, 16, 42]],
  ["Network intrusion detection system", "Active", "Detective", true, "Daily", 15, [3, 12, 38]],
  ["Web application firewall deployment", "Active", "Preventive", true, "Daily", 9, [8, 40, 3]],
  ["Endpoint detection and response", "Active", "Detective", true, "Daily", 39, [9, 42, 38]],
  ["Data encryption at rest", "Active", "Preventive", true, "Daily", 7, [4, 17, 21]],
  ["Automated vulnerability scanning", "Active", "Detective", false, "Weekly", 14, [19, 8, 40]],
  ["Privileged access management", "Active", "Preventive", true, "Daily", 20, [28, 4, 12]],
  ["Security awareness training program", "Active", "Preventive", false, "Quarterly", 1, [2, 10, 50]],
  ["Network segmentation policy", "Active", "Preventive", true, "Monthly", 15, [1, 38, 3]],
  ["Patch management process", "Active", "Preventive", true, "Weekly", 39, [19, 9, 47]],
  ["Data loss prevention system", "Active", "Detective", true, "Daily", 9, [4, 17, 25]],
  ["Backup and recovery testing", "Active", "Detective", false, "Monthly", 10, [47, 37, 36]],
  ["Access control review process", "Active", "Detective", false, "Quarterly", 20, [16, 28, 4]],
  ["Log monitoring and alerting", "Active", "Detective", true, "Daily", 49, [12, 44, 47]],
  ["Incident response procedures", "Active", "Preventive", true, "Monthly", 49, [36, 9, 1]],
  ["Third-party vendor assessment", "Active", "Detective", false, "Quarterly", 9, [23, 31, 7]],
  ["Change management control", "Active", "Preventive", false, "Weekly", 20, [47, 25, 49]],
  ["Secure code review process", "Active", "Preventive", false, "Weekly", 28, [8, 40, 19]],
  ["Database activity monitoring", "Active", "Detective", true, "Daily", 17, [8, 4, 21]],
  ["Cloud security posture management", "Active", "Detective", false, "Weekly", 29, [11, 25, 49]],
  ["Container image scanning", "Active", "Detective", false, "Weekly", 29, [49, 25]],
  ["API security gateway", "Active", "Preventive", true, "Daily", 13, [35, 20]],
  ["Email phishing filter", "Active", "Preventive", true, "Daily", 3, [2, 5, 50]],
  ["SSL/TLS certificate management", "Active", "Preventive", false, "Monthly", 40, [26, 14]],
  ["Identity governance program", "Active", "Preventive", true, "Monthly", 7, [16, 32, 42]],
  ["Physical access control system", "Active", "Preventive", true, "Daily", 38, [29, 36]],
  ["Mobile device management", "Active", "Preventive", false, "Weekly", 39, [45, 38]],
  ["Disaster recovery testing", "Active", "Detective", false, "Quarterly", 10, [36, 47, 34]],
  ["Security information and event management", "Active", "Detective", true, "Daily", 49, [12, 1, 3]],
  ["Zero trust network access", "Active", "Preventive", true, "Daily", 15, [16, 21, 45]],
  ["Data classification policy enforcement", "Active", "Preventive", false, "Monthly", 9, [4, 17, 25]],
  ["Secrets management solution", "Active", "Preventive", true, "Daily", 28, [25, 7]],
  ["Continuous compliance monitoring", "Active", "Detective", false, "Weekly", 33, [44, 6, 23]],
  ["Application whitelisting", "Active", "Preventive", false, "Weekly", 39, [9, 42]],
  ["DNS security controls", "Active", "Preventive", true, "Daily", 15, [41, 33]],
  ["Wireless network security", "Active", "Preventive", false, "Monthly", 37, [45]],
  ["File integrity monitoring", "Active", "Detective", false, "Daily", 49, [9, 46, 19]],
  ["Browser isolation technology", "Active", "Preventive", false, "Weekly", 39, [36, 2]],
  ["Supply chain security verification", "Active", "Detective", false, "Monthly", 9, [7, 31]],
  ["Cloud access security broker", "Active", "Preventive", true, "Daily", 29, [11, 25]],
  ["Dark web monitoring", "Active", "Detective", false, "Weekly", 7, [16, 50, 5]],
  ["Tabletop exercise program", "Active", "Detective", false, "Quarterly", 49, [36, 1]],
  ["Regulatory compliance auditing", "Active", "Detective", false, "Quarterly", 33, [6, 44, 30]],
  ["Data retention policy enforcement", "Active", "Preventive", false, "Monthly", 9, [4, 30]],
  ["Threat intelligence integration", "Active", "Detective", true, "Daily", 14, [12, 13, 19]],
  ["Red team exercise program", "Draft", "Detective", false, "Quarterly", 14, [1, 12]],
  ["Security operations center monitoring", "Active", "Detective", true, "Daily", 49, [1, 3, 12]],
  ["Business continuity planning", "Active", "Preventive", false, "Quarterly", 20, [36, 34, 47]],
  ["Encryption key rotation policy", "Active", "Preventive", false, "Monthly", 40, [26]],
  ["User behavior analytics", "Active", "Detective", false, "Weekly", 7, [4, 5, 42]],
];

export const controls: MockControl[] = raw.map(
  ([name, status, controlType, keyControl, controlFrequency, ownerIdx, crIdxs], i) => ({
    id: padId("CTL", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    status,
    controlType,
    keyControl,
    controlFrequency,
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
  }),
);

const controlById = new Map(controls.map((c) => [c.id, c]));

export function getControlById(id: string): MockControl | undefined {
  return controlById.get(id);
}

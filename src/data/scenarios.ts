import {
  padId,
  getFivePointLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
} from "./types.js";
import type { MockScenario, FivePointScaleValue } from "./types.js";
import { cyberRisks } from "./cyberRisks.js";
import { assets } from "./assets.js";

type ScenarioRow = [
  crIdx: number,
  astIdx: number,
  threatSev: FivePointScaleValue,
  vulnSev: FivePointScaleValue,
  ownerIdx: number,
  thrIdxs: number[],
  vulnIdxs: number[],
];

const raw: ScenarioRow[] = [
  [1, 1, 4, 5, 7, [1], [1]],
  [1, 2, 4, 5, 7, [1], [10]],
  [2, 3, 3, 4, 9, [2], [35]],
  [2, 43, 4, 4, 9, [10], [35]],
  [3, 1, 5, 4, 15, [4], [6]],
  [3, 11, 4, 3, 15, [4], [11]],
  [4, 2, 4, 4, 20, [5], [7]],
  [4, 17, 3, 4, 20, [5], [36]],
  [5, 3, 4, 5, 7, [22], [35]],
  [5, 16, 4, 4, 7, [22], [35]],
  [7, 24, 3, 4, 9, [9], [43]],
  [7, 29, 3, 3, 9, [9], [19]],
  [8, 13, 4, 4, 14, [3], [3]],
  [8, 2, 5, 5, 14, [3], [47]],
  [9, 3, 3, 3, 39, [12], [12]],
  [9, 39, 2, 3, 39, [12], [37]],
  [10, 43, 3, 3, 36, [10], [35]],
  [10, 21, 2, 3, 36, [38], [44]],
  [11, 8, 3, 4, 29, [23], [32]],
  [11, 29, 3, 3, 29, [23], [48]],
  [12, 2, 5, 5, 14, [13], [8]],
  [12, 28, 5, 4, 14, [13], [9]],
  [13, 9, 5, 4, 14, [8], [19]],
  [13, 28, 4, 4, 14, [8], [37]],
  [14, 6, 3, 3, 6, [6], [5]],
  [14, 13, 3, 4, 6, [6], [17]],
  [15, 29, 2, 3, 15, [20], [46]],
  [16, 7, 4, 4, 7, [7], [2]],
  [16, 14, 4, 4, 7, [11], [30]],
  [17, 2, 4, 3, 5, [5], [7]],
  [19, 9, 5, 4, 14, [8], [19]],
  [19, 36, 4, 4, 14, [25], [37]],
  [20, 13, 3, 4, 13, [24], [13]],
  [20, 18, 3, 3, 13, [47], [23]],
  [22, 39, 3, 3, 39, [12], [37]],
  [23, 24, 4, 3, 9, [36], [43]],
  [23, 4, 3, 4, 9, [36], [19]],
  [24, 21, 2, 3, 27, [15], [21]],
  [25, 8, 3, 4, 29, [23], [32]],
  [25, 29, 4, 4, 29, [23], [48]],
  [26, 2, 5, 5, 7, [1], [1]],
  [26, 40, 4, 5, 7, [49], [40]],
  [27, 50, 3, 3, 10, [30], [14]],
  [28, 7, 4, 4, 7, [16], [8]],
  [29, 28, 5, 4, 14, [13], [8]],
  [30, 2, 5, 4, 33, [2], [35]],
  [32, 1, 3, 4, 9, [17], [20]],
  [33, 2, 5, 5, 7, [1], [3]],
  [33, 26, 4, 3, 7, [2], [35]],
  [34, 10, 3, 3, 20, [30], [14]],
];

export const scenarios: MockScenario[] = raw.map(
  ([crIdx, astIdx, threatSeverity, vulnerabilitySeverity, ownerIdx, thrIdxs, vulnIdxs], i) => {
    const risk = cyberRisks[crIdx - 1];
    const asset = assets[astIdx - 1];
    const impact = asset.criticality;
    const likelihood = threatSeverity * vulnerabilitySeverity;
    const cyberRiskScore = impact * likelihood;

    return {
      id: padId("SC", i + 1),
      name: `${risk.name} on ${asset.name}`,
      ownerId: padId("USR", ownerIdx),
      cyberRiskId: padId("CR", crIdx),
      assetId: padId("AST", astIdx),
      impact,
      impactLabel: getFivePointLabel(impact),
      threatSeverity,
      threatSeverityLabel: getFivePointLabel(threatSeverity),
      vulnerabilitySeverity,
      vulnerabilitySeverityLabel: getFivePointLabel(vulnerabilitySeverity),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(cyberRiskScore),
      threatIds: thrIdxs.map((n) => padId("THR", n)),
      vulnerabilityIds: vulnIdxs.map((n) => padId("VUL", n)),
    };
  },
);

const scenarioById = new Map(scenarios.map((s) => [s.id, s]));

export function getScenarioById(id: string): MockScenario | undefined {
  return scenarioById.get(id);
}

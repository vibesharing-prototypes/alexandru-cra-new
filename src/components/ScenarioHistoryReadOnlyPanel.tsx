import { Stack } from "@mui/material";

import type { ScenarioScoringInitialScores } from "./ScenarioScoringDropdownsBlock.js";
import ReadOnlyScoringLegendsRow from "./ReadOnlyScoringLegendsRow.js";
import ScoringRationaleFormattedBody from "./ScoringRationaleFormattedBody.js";
import type { MockScenario } from "../data/types.js";

export type ScenarioHistoryReadOnlySnapshot = {
  scores: ScenarioScoringInitialScores;
  rationaleBody: string;
};

export function buildScenarioHistorySnapshot(
  scenario: MockScenario,
  scores: ScenarioScoringInitialScores,
  opts?: { rationaleBody?: string },
): ScenarioHistoryReadOnlySnapshot {
  return {
    scores,
    rationaleBody: opts?.rationaleBody ?? scenario.scoringRationale,
  };
}

export default function ScenarioHistoryReadOnlyPanel({ snapshot }: { snapshot: ScenarioHistoryReadOnlySnapshot }) {
  return (
    <Stack gap={3} sx={{ width: "100%", pt: 0.5 }}>
      <ReadOnlyScoringLegendsRow scores={snapshot.scores} />
      <ScoringRationaleFormattedBody text={snapshot.rationaleBody} />
    </Stack>
  );
}

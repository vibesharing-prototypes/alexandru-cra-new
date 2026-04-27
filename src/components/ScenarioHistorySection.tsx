import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import { Stack } from "@mui/material";

import HistoryAccordion, { formatHistoryLogDateTime } from "./HistoryAccordion.js";
import ScenarioHistoryReadOnlyPanel, {
  type ScenarioHistoryReadOnlySnapshot,
} from "./ScenarioHistoryReadOnlyPanel.js";

export type ScenarioHistoryEntry = {
  id: string;
  owner: string;
  at: Date;
  snapshot: ScenarioHistoryReadOnlySnapshot;
};

export function ScenarioHistorySection({
  scenarioId,
  entries,
  expandedEntryId,
  onExpandedEntryChange,
}: {
  scenarioId: string;
  entries: ScenarioHistoryEntry[];
  expandedEntryId: string | false;
  onExpandedEntryChange: (id: string | false) => void;
}) {
  return (
    <Stack sx={{ width: "100%" }} gap={2}>
      <SectionHeader title="History" headingLevel="h3" />
      <Stack gap={0} sx={{ width: "100%" }}>
        {entries.map((entry) => {
          const panelId = `${scenarioId}-history-${entry.id}`;
          const expanded = expandedEntryId === entry.id;
          return (
            <HistoryAccordion
              key={entry.id}
              panelId={panelId}
              title={entry.owner}
              subtitle={formatHistoryLogDateTime(entry.at)}
              expanded={expanded}
              onExpandedChange={(next) => onExpandedEntryChange(next ? entry.id : false)}
            >
              <ScenarioHistoryReadOnlyPanel snapshot={entry.snapshot} />
            </HistoryAccordion>
          );
        })}
      </Stack>
    </Stack>
  );
}

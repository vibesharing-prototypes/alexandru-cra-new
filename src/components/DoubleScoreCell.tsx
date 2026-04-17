import { Stack } from "@mui/material";

import LabelScoreLegend, { type LabelScoreLegendValue } from "./LabelScoreLegend.js";

const legendHugSx = {
  flex: "0 0 auto",
  width: "max-content",
} as const;

export type DoubleScoreCellProps = {
  inherent: LabelScoreLegendValue;
  residual: LabelScoreLegendValue;
  /** Passed to both legends when `value` is null */
  emptyText?: string;
};

/**
 * Two {@link LabelScoreLegend} instances (Inherent / Residual) in one row with 16px gap.
 * Row width is intrinsic (both legends + gap) so table `layout: auto` can grow the column.
 */
export default function DoubleScoreCell({
  inherent,
  residual,
  emptyText,
}: DoubleScoreCellProps) {
  return (
    <Stack
      direction="row"
      flexWrap="nowrap"
      alignItems="center"
      sx={{
        display: "inline-flex",
        width: "fit-content",
        minWidth: 0,
        boxSizing: "border-box",
        gap: ({ tokens: t }) => t.core.spacing["2"].value,
        p: 0,
      }}
    >
      <LabelScoreLegend
        label="Inherent"
        value={inherent}
        emptyText={emptyText}
        sx={legendHugSx}
      />
      <LabelScoreLegend
        label="Residual"
        value={residual}
        emptyText={emptyText}
        sx={legendHugSx}
      />
    </Stack>
  );
}

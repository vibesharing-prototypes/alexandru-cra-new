import { Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import { RagSwatch } from "./ScoringMetricField.js";
import type { RagDataVizKey } from "../data/ragDataVisualization.js";

/** Score payload: numeric band, human label, and RAG visualization key */
export type LabelScoreLegendValue = {
  numeric: string;
  label: string;
  rag: RagDataVizKey;
} | null;

export type LabelScoreLegendProps = {
  /** Metric label (matches History / {@link ReadOnlyScoringLegendsRow} caption emphasis) */
  label: string;
  /** When null, `emptyText` is shown in the score row */
  value: LabelScoreLegendValue;
  /** Placeholder for the score row when `value` is null */
  emptyText?: string;
  /** Merged onto the root stack after defaults (e.g. shrink-to-content in a row) */
  sx?: SxProps<Theme>;
};

/**
 * Label + read-only score aligned with History read-only metrics ({@link ReadOnlyScoringLegendsRow}):
 * caption label (sm, semibold), then swatch + `numeric - label` on text/md.
 */
export default function LabelScoreLegend({
  label,
  value,
  emptyText = "Not scored",
  sx,
}: LabelScoreLegendProps) {
  return (
    <Stack
      alignItems="flex-start"
      justifyContent="flex-start"
      gap={0.5}
      sx={[
        {
          flex: "1 1 auto",
          minWidth: 0,
          py: 0,
        },
        ...(sx != null ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      <Typography
        variant="caption"
        component="p"
        sx={({ tokens: t }) => ({
          m: 0,
          fontWeight: 600,
          letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
          fontSize: t.semantic.font.label.sm.fontSize.value,
          lineHeight: t.semantic.font.label.sm.lineHeight.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        {label}
      </Typography>

      {value == null ? (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.muted.value,
            fontSize: t.semantic.font.text.md.fontSize.value,
          })}
        >
          {emptyText}
        </Typography>
      ) : (
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, alignSelf: "stretch" }}>
          <RagSwatch rag={value.rag} />
          <Typography
            variant="body1"
            component="span"
            sx={({ tokens: t }) => ({
              color: t.semantic.color.type.default.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              fontWeight: 400,
            })}
          >
            {value.numeric} - {value.label}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

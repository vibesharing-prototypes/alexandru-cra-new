import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";

/** Score payload: numeric band, human label, and RAG visualization key */
export type LabelScoreLegendValue = {
  numeric: string;
  label: string;
  rag: RagDataVizKey;
} | null;

export type LabelScoreLegendProps = {
  /** Metric label (label/xs emphasis — muted) */
  label: string;
  /** When null, `emptyText` is shown in the score row */
  value: LabelScoreLegendValue;
  /** Placeholder for the score row when `value` is null */
  emptyText?: string;
  /** Merged onto the root stack after defaults (e.g. shrink-to-content in a row) */
  sx?: SxProps<Theme>;
};

/**
 * Label + read-only score: column (4px gap), label/xs emphasis, then RAG swatch + label/xs value.
 * Layout matches design: min-width 90px, ~36px tall, 8px between swatch and score text.
 */
export default function LabelScoreLegend({
  label,
  value,
  emptyText = "-",
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
          minWidth: 90,
          minHeight: 36,
          py: 0,
        },
        ...(sx != null ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      <Typography
        component="p"
        sx={({ tokens: t }) => ({
          m: 0,
          width: "100%",
          fontSize: t.semantic.font.label.xs.fontSize.value,
          lineHeight: t.semantic.font.label.xs.lineHeight.value,
          letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
          fontFamily: t.semantic.font.label.xs.fontFamily.value,
          fontWeight: t.semantic.fontWeight.emphasis.value,
          color: t.semantic.color.type.muted.value,
        })}
      >
        {label}
      </Typography>

      {value == null ? (
        <Typography
          component="p"
          sx={({ tokens: t }) => ({
            m: 0,
            fontSize: t.semantic.font.label.xs.fontSize.value,
            lineHeight: t.semantic.font.label.xs.lineHeight.value,
            letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
            fontFamily: t.semantic.font.label.xs.fontFamily.value,
            fontWeight: t.semantic.font.label.xs.fontWeight.value,
            color: t.semantic.color.type.muted.value,
          })}
        >
          {emptyText}
        </Typography>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ alignSelf: "stretch", minHeight: 16 }}
        >
          <Box
            sx={({ tokens: t }) => ({
              width: 16,
              height: 16,
              borderRadius: t.semantic.radius.sm.value,
              flexShrink: 0,
              bgcolor: ragDataVizColor(t, value.rag),
            })}
            aria-hidden
          />
          <Typography
            component="span"
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.label.xs.fontSize.value,
              lineHeight: t.semantic.font.label.xs.lineHeight.value,
              letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
              fontFamily: t.semantic.font.label.xs.fontFamily.value,
              fontWeight: t.semantic.font.label.xs.fontWeight.value,
              color: t.semantic.color.type.default.value,
              whiteSpace: "nowrap",
            })}
          >
            {value.numeric} {value.label}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

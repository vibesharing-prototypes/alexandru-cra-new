import { Box, Stack, Typography, useTheme } from "@mui/material";

import { ragDataVizColor, type RagDataVizKey } from "../../data/ragDataVisualization.js";

export type ScoringRangeSegment = {
  bandLabel: string;
  from: number;
  to: number;
  rag: RagDataVizKey;
};

export type ScoringScaleRangeBarProps = {
  segments: ScoringRangeSegment[];
};

/**
 * Five-column range summary used above band cards (Figma: labels + 12px bar + “N to M”).
 */
export default function ScoringScaleRangeBar({ segments }: ScoringScaleRangeBarProps) {
  const { tokens: t } = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        width: "100%",
        alignItems: "flex-start",
        minWidth: 0,
        isolation: "isolate",
      }}
    >
      {segments.map((seg, index) => {
        const isFirst = index === 0;
        const isLast = index === segments.length - 1;
        return (
          <Box
            key={seg.bandLabel}
            sx={{ flex: "1 1 0", minWidth: 0, zIndex: segments.length - index }}
          >
            <Stack gap={0.5} alignItems="flex-start" sx={{ width: "100%" }}>
              <Typography
                component="p"
                sx={{
                  m: 0,
                  color: t.semantic.color.type.muted.value,
                  fontSize: 11,
                  lineHeight: "16px",
                  letterSpacing: 0.4,
                  fontWeight: 400,
                }}
              >
                {seg.bandLabel}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 12,
                  borderRadius: 0.5,
                  borderTopLeftRadius: isFirst ? 4 : 0,
                  borderBottomLeftRadius: isFirst ? 4 : 0,
                  borderTopRightRadius: isLast ? 4 : 0,
                  borderBottomRightRadius: isLast ? 4 : 0,
                  bgcolor: ragDataVizColor(t, seg.rag),
                }}
                aria-hidden
              />
              <Typography
                component="p"
                sx={{
                  m: 0,
                  color: t.semantic.color.type.default.value,
                  fontSize: 11,
                  lineHeight: "16px",
                  letterSpacing: 0.4,
                  fontWeight: 600,
                }}
              >
                {seg.from} to {seg.to}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}

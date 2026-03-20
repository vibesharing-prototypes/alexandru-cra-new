import { Box, Typography } from "@mui/material";

import type { CraTitleSegment } from "../data/craScoringScenarioLibrary.js";

export default function CraScenarioEmphasisTitle({ segments }: { segments: CraTitleSegment[] }) {
  return (
    <Typography
      component="span"
      sx={({ tokens: t }) => ({
        fontSize: t.semantic.font.text.md.fontSize.value,
        lineHeight: t.semantic.font.text.md.lineHeight.value,
        letterSpacing: t.semantic.font.text.md.letterSpacing.value,
        color: t.semantic.color.type.default.value,
      })}
    >
      {segments.map((s, i) =>
        s.emphasize ? (
          <Box
            key={i}
            component="span"
            sx={({ tokens: t }) => ({
              fontWeight: 600,
              textDecoration: "underline",
              color: t.semantic.color.action.link.default.value,
            })}
          >
            {s.text}
          </Box>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </Typography>
  );
}

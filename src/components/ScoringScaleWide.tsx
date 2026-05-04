import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

export type ScoringScaleWideProps = {
  /** Router path for “View scoring scales”. */
  scalesHref?: string;
};

/**
 * Scoring scale summary: heading and link to settings (Figma: ITRM — Scoring scale).
 */
export default function ScoringScaleWide({
  scalesHref = "/settings/cyber-risk-settings",
}: ScoringScaleWideProps) {
  return (
    <Box
      component="section"
      aria-labelledby="scoring-scale-wide-heading"
      sx={({ tokens: tok }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tok.core.spacing["1_5"].value,
        width: "100%",
      })}
    >
      <Typography
        id="scoring-scale-wide-heading"
        component="h2"
        variant="caption"
        sx={({ tokens: tok }) => ({
          m: 0,
          fontFamily: tok.semantic.font.label.sm.fontFamily.value,
          fontSize: tok.semantic.font.label.sm.fontSize.value,
          lineHeight: tok.semantic.font.label.sm.lineHeight.value,
          letterSpacing: tok.semantic.font.label.sm.letterSpacing.value,
          fontWeight: tok.semantic.fontWeight.emphasis.value,
          color: tok.semantic.color.type.default.value,
        })}
      >
        Scoring scale
      </Typography>

      <Link
        component={RouterLink}
        to={scalesHref}
        underline="always"
        sx={({ tokens: tok }) => ({
          fontFamily: tok.semantic.font.label.sm.fontFamily.value,
          fontSize: tok.semantic.font.label.sm.fontSize.value,
          lineHeight: tok.semantic.font.label.sm.lineHeight.value,
          letterSpacing: tok.semantic.font.label.sm.letterSpacing.value,
          fontWeight: tok.semantic.fontWeight.emphasis.value,
          color: tok.semantic.color.type.default.value,
          textDecorationColor: "currentcolor",
        })}
      >
        View scoring scales
      </Link>
    </Box>
  );
}

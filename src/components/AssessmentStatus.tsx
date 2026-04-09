import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";

export type AssessmentStatusProps = {
  status: AssessmentStatusValue;
  /** When the visible label differs from the canonical status string (e.g. "Approved assessment"). */
  label?: string;
};

type Tokens = Theme extends { tokens: infer T } ? T : never;

type TokenPick = (tokens: Tokens) => string;

const STATUS_BACKGROUND: Record<AssessmentStatusValue, TokenPick> = {
  Draft: (t) => t.semantic.color.status.neutral.backgroundVariant.value,
  Scoping: (t) => t.semantic.color.accent.blue.background.value,
  "In progress": (t) => t.semantic.color.accent.blue.background.value,
  Approved: (t) => t.semantic.color.status.success.default.value,
  Overdue: (t) => t.semantic.color.status.error.default.value,
};

const STATUS_FOREGROUND: Record<AssessmentStatusValue, TokenPick> = {
  Draft: (t) => t.semantic.color.status.neutral.text.value,
  Scoping: (t) => t.semantic.color.accent.blue.content.value,
  "In progress": (t) => t.semantic.color.accent.blue.content.value,
  Approved: (t) => t.semantic.color.type.default.value,
  Overdue: (t) => t.semantic.color.type.inverse.value,
};

/**
 * Renders assessment lifecycle status with Atlas semantic colors aligned to CRA data
 * (`MockCyberRiskAssessment.status` / `riskAssessments`).
 */
export default function AssessmentStatus({ status, label }: AssessmentStatusProps) {
  return (
    <Box
      sx={({ tokens }) => ({
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.25,
        borderRadius: 9999,
        minHeight: 24,
        backgroundColor: STATUS_BACKGROUND[status](tokens),
      })}
    >
      <Typography
        variant="textSm"
        sx={({ tokens }) => ({
          color: STATUS_FOREGROUND[status](tokens),
          fontWeight: 600,
          lineHeight: "16px",
          letterSpacing: "0.3px",
        })}
      >
        {label ?? status}
      </Typography>
    </Box>
  );
}

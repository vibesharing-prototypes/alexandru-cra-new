import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import type { CyberRiskStatus } from "../data/types.js";

export type RiskStatusProps = {
  status: CyberRiskStatus;
  /** Optional override for the visible label. */
  label?: string;
};

type Tokens = Theme extends { tokens: infer T } ? T : never;
type TokenPick = (tokens: Tokens) => string;

const neutralStatusContentVariant: TokenPick = (t) =>
  t.semantic.color.status.neutral.textDefault.value;

const STATUS_BACKGROUND: Record<CyberRiskStatus, TokenPick> = {
  Draft: (t) => t.semantic.color.status.neutral.backgroundVariant.value,
  Identification: (t) => t.semantic.color.status.notification.default.value,
  Assessment: (t) => t.core.color.purple["70"].value,
  Mitigation: (t) => t.semantic.color.status.success.default.value,
  Monitoring: (t) => t.semantic.color.accent.blue.background.value,
};

const STATUS_FOREGROUND: Record<CyberRiskStatus, TokenPick> = {
  Draft: neutralStatusContentVariant,
  Identification: neutralStatusContentVariant,
  Assessment: neutralStatusContentVariant,
  Mitigation: neutralStatusContentVariant,
  Monitoring: (t) => t.semantic.color.accent.blue.content.value,
};

/**
 * Renders Cyber Risk status with Atlas semantic colors.
 * Mapped to `MockCyberRisk.status` values: Draft, Identification, Assessment, Mitigation, Monitoring.
 */
export default function RiskStatus({ status, label }: RiskStatusProps) {
  return (
    <Box
      sx={({ tokens }) => ({
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.25,
        borderRadius: 9999,
        minHeight: 24,
        backgroundColor: STATUS_BACKGROUND[status](tokens as Tokens),
      })}
    >
      <Typography
        variant="textSm"
        sx={({ tokens }) => ({
          color: STATUS_FOREGROUND[status](tokens as Tokens),
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

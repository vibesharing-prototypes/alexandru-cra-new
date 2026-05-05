import { useId, type ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

import ScoringInfo, { type ScoringInfoProps } from "./ScoringInfo.js";

export type ScoringInfoCardProps = ScoringInfoProps & {
  /**
   * When true, only the card chrome and scoring row are shown (no title, subtitle, or AI button).
   * Use when the AI scoring header is not applicable for the current assessment phase.
   */
  omitHeader?: boolean;
  /** Primary heading (Figma: AI scoring). Ignored when `omitHeader` is true. */
  title?: string;
  /** Supporting copy below the title. Ignored when `omitHeader` is true. */
  description?: ReactNode;
  /** Button label (Figma: Start AI scoring). Ignored when `omitHeader` is true. */
  actionLabel?: string;
  /** Invoked when the primary action is activated. Omit to hide the button. */
  onAction?: () => void;
  /** When true, the action button shows a loading state (hides the sparkle icon). */
  actionLoading?: boolean;
};

/**
 * AI scoring card from Figma (ITRM — Cyber Risk Management, node 11172:76267): header row with title,
 * subtitle, and AI button; bordered container with {@link ScoringInfo} below.
 */
export default function ScoringInfoCard({
  omitHeader = false,
  title = "AI scoring",
  description = "Our AI agent will automatically score all the scenarios.",
  actionLabel = "Start AI scoring",
  onAction,
  actionLoading = false,
  aggregationMethodRadio,
  scoringFormulas,
  scoringScaleInfo,
}: ScoringInfoCardProps = {}) {
  const {
    presets: { CircularProgressPresets },
  } = useTheme();
  const titleId = useId();

  return (
    <Box
      component="section"
      aria-labelledby={omitHeader ? undefined : titleId}
      sx={({ tokens: t }) => ({
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: t.semantic.radius.lg.value,
        borderWidth: t.semantic.borderWidth.thin.value,
        borderStyle: "solid",
        borderColor: t.semantic.color.ui.divider.default.value,
        backgroundColor: t.semantic.color.background.base.value,
        px: t.core.spacing["3"].value,
        py: t.core.spacing["2"].value,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: t.core.spacing["4"].value,
      })}
    >
      {omitHeader ? null : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={({ tokens: t }) => ({
            width: "100%",
            minWidth: 0,
            flexWrap: "wrap",
            gap: t.core.spacing["2"].value,
          })}
        >
          <Stack
            sx={({ tokens: t }) => ({
              flex: "1 1 0",
              minWidth: 0,
              gap: t.core.spacing["0_5"].value,
              alignItems: "flex-start",
            })}
          >
            <Typography
              id={titleId}
              component="h2"
              variant="body1"
              sx={({ tokens: t }) => ({
                m: 0,
                width: "100%",
                fontFamily: t.semantic.font.text.body.fontFamily.value,
                fontSize: t.semantic.font.text.body.fontSize.value,
                lineHeight: t.semantic.font.text.body.lineHeight.value,
                letterSpacing: t.semantic.font.text.body.letterSpacing.value,
                fontWeight: t.semantic.fontWeight.emphasis.value,
                color: t.semantic.color.type.default.value,
              })}
            >
              {title}
            </Typography>
            {typeof description === "string" ? (
              <Typography
                component="p"
                variant="textMd"
                sx={({ tokens: t }) => ({
                  m: 0,
                  width: "100%",
                  fontFamily: t.semantic.font.text.md.fontFamily.value,
                  fontSize: t.semantic.font.text.md.fontSize.value,
                  lineHeight: t.semantic.font.text.md.lineHeight.value,
                  letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                  fontWeight: t.core.fontWeight.regular.value,
                  color: t.semantic.color.type.default.value,
                })}
              >
                {description}
              </Typography>
            ) : (
              <Box
                sx={({ tokens: t }) => ({
                  width: "100%",
                  minWidth: 0,
                  fontFamily: t.semantic.font.text.md.fontFamily.value,
                  fontSize: t.semantic.font.text.md.fontSize.value,
                  lineHeight: t.semantic.font.text.md.lineHeight.value,
                  letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                  fontWeight: t.core.fontWeight.regular.value,
                  color: t.semantic.color.type.default.value,
                })}
              >
                {description}
              </Box>
            )}
          </Stack>

          {onAction ? (
            <Button
              type="button"
              variant="outlined"
              color="ai"
              size="medium"
              startIcon={actionLoading ? undefined : <AiSparkleIcon aria-hidden />}
              loading={actionLoading}
              loadingPosition="start"
              loadingIndicator={
                <CircularProgress color="inherit" {...CircularProgressPresets.size.sm} />
              }
              onClick={onAction}
              aria-busy={actionLoading}
              sx={({ tokens: t }) => ({
                flexShrink: 0,
                alignSelf: { xs: "stretch", sm: "center" },
                minHeight: 40,
                px: t.core.spacing["1_5"].value,
                py: t.core.spacing["0_5"].value,
                borderRadius: t.semantic.radius.lg.value,
              })}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      )}

      <ScoringInfo
        aggregationMethodRadio={aggregationMethodRadio}
        scoringFormulas={scoringFormulas}
        scoringScaleInfo={scoringScaleInfo}
      />
    </Box>
  );
}

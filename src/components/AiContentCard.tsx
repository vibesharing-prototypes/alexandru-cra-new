import { useId, useState, type ReactNode } from "react";
import { Card } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

const AI_TEXT_GRADIENT =
  "linear-gradient(128.4deg, #BE0C1E 17.49%, #AB48DA 58.74%, #4069FE 100%)";

export type AiContentCardProps = {
  /** Main body: any layout or components */
  children: ReactNode;
};

export type AiContentCardAssessmentPresetProps = {
  /** Gradient heading next to the AI sparkle icon */
  title?: string;
  /** Supporting body copy (plain string or rich layout). */
  description?: ReactNode;
  /** Label above the radio group */
  assessmentTypeLabel?: string;
  /** When true, only the gradient title and description are shown (no radio group). */
  omitAssessmentType?: boolean;
  /** Row of radio options: value and user-visible label */
  assessmentOptions?: { value: string; label: string }[];
  /** Initially selected option `value` (uncontrolled only) */
  defaultAssessmentValue?: string;
  /** Controlled selection; use with `onAssessmentChange` */
  assessmentValue?: string;
  onAssessmentChange?: (value: string) => void;
  /** Primary AI action label (shown to the right of the description when `onAction` is set). */
  actionLabel?: string;
  /** Invoked when the primary AI action is activated */
  onAction?: () => void;
  /** When true, the action button shows a loading state (hides sparkle start icon). */
  actionLoading?: boolean;
};

const DEFAULT_OPTIONS = [
  { value: "quick", label: "Quick scan" },
  { value: "standard", label: "Standard" },
  { value: "full", label: "Full evaluation" },
] as const;

const emphasis600Sx = { fontWeight: 600 as const };

/** Body copy for the CRA scoring tab AI card (Impact × Likelihood lines + semibold formulas). */
export function AiContentCardScoringDescription() {
  return (
    <Stack spacing={1} sx={{ width: "100%", color: "inherit" }}>
      <Typography variant="body1" component="p" sx={{ m: 0 }}>
        Assessments will be scored using{" "}
        <Box component="span" sx={emphasis600Sx}>
          Impact x Likelihood
        </Box>
        .
      </Typography>
      <Typography variant="body1" component="p" sx={{ m: 0 }}>
        Impact is determined by Asset criticality and Likelihood is determined by{" "}
        <Box component="span" sx={emphasis600Sx}>
          Vulnerability severity x Threat severity
        </Box>
        .
      </Typography>
      <Typography variant="body1" component="p" sx={{ m: 0 }}>
        Review and adjust values in the table below before approving the assessment.
      </Typography>
    </Stack>
  );
}

/**
 * AI-themed card shell: Atlas `Card` with AI start accent and a padded main slot for
 * arbitrary content.
 */
export default function AiContentCard({ children }: AiContentCardProps) {
  return (
    <Card
      color="ai-start"
      sx={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        maxWidth: 1280,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pt: 0,
        px: 0,
        borderRadius: ({ tokens: t }) => t.semantic.radius.md.value,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Stack
          sx={{
            pt: 2,
            pb: ({ tokens: t }) => t.core.spacing["2"].value,
            gap: 3,
          }}
        >
          <Box sx={{ px: 3, width: "100%", boxSizing: "border-box" }}>{children}</Box>
        </Stack>
      </Box>
    </Card>
  );
}

/**
 * Default assessment UI for {@link AiContentCard}: gradient title, description,
 * optional inline AI action, and assessment type radio group.
 */
export function AiContentCardAssessmentPreset({
  title = "Choose how AI helps",
  description = "Pick an assessment type so we can tailor AI suggestions to your workflow.",
  assessmentTypeLabel = "Assessment type",
  omitAssessmentType = false,
  assessmentOptions = [...DEFAULT_OPTIONS],
  defaultAssessmentValue = "full",
  assessmentValue: controlledValue,
  onAssessmentChange,
  actionLabel = "Generate with AI",
  onAction,
  actionLoading = false,
}: AiContentCardAssessmentPresetProps) {
  const {
    presets: { CircularProgressPresets },
  } = useTheme();
  const groupId = useId();
  const sectionTitleId = `${groupId}-heading`;
  const labelId = `${groupId}-label`;
  const [uncontrolled, setUncontrolled] = useState(defaultAssessmentValue);
  const isControlled = controlledValue !== undefined && onAssessmentChange !== undefined;
  const assessment = isControlled ? controlledValue : uncontrolled;
  const setAssessment = isControlled ? onAssessmentChange : setUncontrolled;

  const descriptionBody = (
    <Box
      sx={({ tokens: t }) => ({
        m: 0,
        color: t.semantic.color.type.default.value,
        ...(onAction ? { flex: 1, minWidth: 0 } : {}),
      })}
    >
      {typeof description === "string" ? (
        <Typography variant="body1" component="p" sx={{ m: 0 }}>
          {description}
        </Typography>
      ) : (
        description
      )}
    </Box>
  );

  const primaryActionButton = onAction ? (
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
      sx={{ flexShrink: 0, alignSelf: "flex-start" }}
    >
      {actionLabel}
    </Button>
  ) : null;

  return (
    <Stack
      component="section"
      aria-labelledby={sectionTitleId}
      gap={3}
      alignItems="flex-start"
      sx={{ width: "100%" }}
    >
      <Stack gap={2} alignItems="flex-start" sx={{ width: "100%" }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              flexShrink: 0,
            }}
            aria-hidden
          >
            <AiSparkleIcon size="lg" />
          </Box>
          <Typography
            id={sectionTitleId}
            component="h2"
            sx={({ tokens: t }) => ({
              m: 0,
              fontFamily: t.semantic.font.title.h4Md.fontFamily.value,
              fontSize: t.semantic.font.title.h4Md.fontSize.value,
              lineHeight: t.semantic.font.title.h4Md.lineHeight.value,
              letterSpacing: t.semantic.font.title.h4Md.letterSpacing.value,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              background: AI_TEXT_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            })}
          >
            {title}
          </Typography>
        </Stack>

        {onAction ? (
          <Stack
            direction="row"
            alignItems="flex-start"
            gap={2}
            sx={{ width: "100%", boxSizing: "border-box" }}
          >
            {descriptionBody}
            {primaryActionButton}
          </Stack>
        ) : (
          descriptionBody
        )}
      </Stack>

      {omitAssessmentType ? null : (
        <Stack gap={0} alignItems="flex-start" sx={{ width: "100%" }}>
          <Typography
            id={labelId}
            component="p"
            variant="labelSm"
            sx={({ tokens: t }) => ({
              m: 0,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            {assessmentTypeLabel}
          </Typography>

          <FormControl sx={{ width: "100%" }}>
            <RadioGroup
              row
              name={`${groupId}-assessment`}
              value={assessment}
              onChange={(_, v) => setAssessment(v)}
              aria-labelledby={labelId}
              sx={{
                flexWrap: "wrap",
                gap: 2,
                columnGap: 2,
                rowGap: 1,
              }}
            >
              {assessmentOptions.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                  sx={{
                    mr: 0,
                    ml: 0,
                    "& .MuiFormControlLabel-label": ({ tokens: t }) => ({
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      color: t.semantic.color.type.default.value,
                    }),
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>
      )}
    </Stack>
  );
}

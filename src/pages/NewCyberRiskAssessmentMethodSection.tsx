import { useCallback, useRef, useState } from "react";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import { Box, Link, Stack, Typography } from "@mui/material";

import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import RadioButtonArray from "../components/RadioButtonArray.js";
import type { CraScoringTypeChoice } from "./craNewAssessmentDraftStorage.js";

const SCORING_TYPE_OPTIONS = [
  { value: "inherent" satisfies CraScoringTypeChoice, label: "Inherent" },
  { value: "residual" satisfies CraScoringTypeChoice, label: "Residual" },
] as const;

const ASSESSMENT_METHOD_BODY =
  "This is a qualitative assessment. Risks are scored using Impact × Likelihood, where Impact is determined by asset criticality and Likelihood by Vulnerability severity × Threat severity. This produces a score from 1–125, mapped to ordinal risk bands (Very low, Low, Medium, High, Very high).";

export type NewCyberRiskAssessmentMethodSectionProps = {
  scoringType: CraScoringTypeChoice;
  onScoringTypeChange: (value: CraScoringTypeChoice) => void;
  /** When true, scoring radios, instructions editor, and attachments are not editable. */
  readOnly?: boolean;
};

/**
 * Assessment method, instructions, and attachments — embedded on the Details tab (formerly the Method tab).
 */
export default function NewCyberRiskAssessmentMethodSection({
  scoringType,
  onScoringTypeChange,
  readOnly = false,
}: NewCyberRiskAssessmentMethodSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [instructions, setInstructions] = useState("");

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Stack gap={3} sx={{ width: "100%" }}>
      <Stack gap={2}>
        <Typography
          variant="caption"
          fontWeight={600}
          component="p"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.default.value,
            letterSpacing: "0.3px",
            m: 0,
            fontSize: "24px",
            lineHeight: 1.3,
          })}
        >
          Assessment method
        </Typography>

        <Typography
          variant="textMd"
          component="p"
          sx={({ tokens: t }) => ({
            m: 0,
            color: t.semantic.color.type.default.value,
            fontSize: t.semantic.font.text.body.fontSize.value,
            lineHeight: t.semantic.font.text.body.lineHeight.value,
            letterSpacing: t.semantic.font.text.body.letterSpacing.value,
          })}
        >
          {ASSESSMENT_METHOD_BODY}
        </Typography>

        <Box sx={{ pt: 1 }}>
          <RadioButtonArray
            label="Scoring type"
            name="new-cra-scoring-type"
            options={SCORING_TYPE_OPTIONS}
            value={scoringType}
            onChange={(v) => {
              if (v === "inherent" || v === "residual") {
                onScoringTypeChange(v);
              }
            }}
            showAction
            showIcon={false}
            showActionText
            actionTextPlain
            actionText="Select whether assessment scores contribute to the inherent or residual risk score."
            disabled={readOnly}
          />
        </Box>
      </Stack>

      <Stack gap={3} sx={{ pt: 2 }}>
        <SectionHeader title="Background and scope" headingLevel="h2" />

        <Stack gap={3}>
          <AssessmentWysiwygEditor
            fieldId="new-cra-assessment-instructions"
            label="Assessment instructions"
            required
            placeholder="Insert description"
            value={instructions}
            onChange={setInstructions}
            minRows={10}
            aria-label="Assessment instructions"
            readOnly={readOnly}
          />

          <Stack gap={1}>
            <Typography
              variant="caption"
              fontWeight={600}
              component="p"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.default.value,
                letterSpacing: "0.3px",
                m: 0,
                maxWidth: 600,
              })}
            >
              Attachments
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".jpg,.jpeg,.pdf,.xls,.xlsx"
              disabled={readOnly}
            />

            <Box
              sx={({ tokens: t }) => ({
                borderStyle: "dashed",
                borderWidth: t.semantic.borderWidth.thin.value,
                borderColor: t.semantic.color.outline.default.value,
                borderRadius: t.semantic.radius.lg.value,
                px: 3,
                py: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                pointerEvents: readOnly ? "none" : undefined,
                opacity: readOnly ? 0.85 : undefined,
                ...(!readOnly
                  ? {
                      "&:hover": {
                        borderColor: t.semantic.color.outline.hover.value,
                        backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                      },
                    }
                  : {}),
              })}
            >
              <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                <UploadIcon aria-hidden size="lg" />
                <Typography
                  component="p"
                  variant="body1"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.default.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                  })}
                >
                  Drag files here or{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={readOnly ? undefined : openFilePicker}
                    disabled={readOnly}
                    sx={({ tokens: t }) => ({
                      verticalAlign: "baseline",
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      fontWeight: 600,
                      textDecoration: "underline",
                      color: t.semantic.color.action.link.default.value,
                      cursor: "pointer",
                      border: "none",
                      background: "none",
                      padding: 0,
                      fontFamily: "inherit",
                    })}
                  >
                    select files to upload
                  </Link>
                </Typography>
              </Stack>
              <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.muted.value,
                    letterSpacing: "0.3px",
                    width: "100%",
                  })}
                >
                  Formats: JPG, PDF, XLS
                </Typography>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.muted.value,
                    letterSpacing: "0.3px",
                    width: "100%",
                  })}
                >
                  Max. file size: 5 MB
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

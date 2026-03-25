import { useMemo } from "react";
import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { Box, Container, Stack, Typography } from "@mui/material";
import { NavLink, useLocation, useNavigate, useParams } from "react-router";

import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import CraScenarioEmphasisTitle from "../components/CraScenarioEmphasisTitle.js";
import {
  type CraScoreValue,
  getCraScenarioById,
} from "../data/craScoringScenarioLibrary.js";

const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

type RagPalette = {
  negative: Record<"03" | "04" | "05", { value: string }>;
  neutral: Record<"03", { value: string }>;
  positive: Record<"04", { value: string }>;
};

function ragSwatchColor(
  tokens: { semantic: { color: { dataVisualization: { rag: RagPalette } } } },
  rag: NonNullable<CraScoreValue>["rag"],
) {
  const { rag: r } = tokens.semantic.color.dataVisualization;
  switch (rag) {
    case "neg05":
      return r.negative["05"].value;
    case "neg04":
      return r.negative["04"].value;
    case "neg03":
      return r.negative["03"].value;
    case "neu03":
      return r.neutral["03"].value;
    case "pos04":
      return r.positive["04"].value;
    default:
      return r.neutral["03"].value;
  }
}

function ScoringMetricField({ label, value }: { label: string; value: CraScoreValue }) {
  return (
    <Stack gap={0.5}>
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
      <Box
        sx={({ tokens: t }) => ({
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 48,
          px: 2,
          py: 1,
          borderRadius: t.semantic.radius.md.value,
          border: `1px solid ${t.semantic.color.outline.default.value}`,
          bgcolor: t.semantic.color.background.base.value,
        })}
      >
        {value ? (
          <>
            <Box
              sx={({ tokens: t }) => ({
                width: 16,
                height: 16,
                borderRadius: t.semantic.radius.sm.value,
                flexShrink: 0,
                bgcolor: ragSwatchColor(t, value.rag),
              })}
              aria-hidden
            />
            <Typography
              sx={({ tokens: t }) => ({
                flex: 1,
                minWidth: 0,
                fontSize: t.semantic.font.text.md.fontSize.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                color: t.semantic.color.type.default.value,
              })}
            >
              {value.numeric} - {value.label}
            </Typography>
            <Box
              component="span"
              aria-hidden
              sx={({ tokens: t }) => ({
                flexShrink: 0,
                color: t.semantic.color.type.muted.value,
                width: 24,
                height: 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <ExpandDownIcon />
            </Box>
          </>
        ) : (
          <Typography
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.text.md.fontSize.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              color: t.semantic.color.type.muted.value,
            })}
          >
            Not scored
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function NewCyberRiskAssessmentScenarioDetailPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentNameFromNav = (location.state as { assessmentName?: string } | null)?.assessmentName;

  const scenario = scenarioId ? getCraScenarioById(scenarioId) : undefined;

  const assessmentTitle = (assessmentNameFromNav ?? "").trim() || "New cyber risk assessment";

  const breadcrumbs = useMemo(
    () => (
      <OverflowBreadcrumbs
        leadingElement={<span>Asset manager</span>}
        hideLastItem
        items={[
          { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_PATH },
          { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_PATH },
          { id: "assessment", label: assessmentTitle, url: NEW_CRA_PATH },
        ]}
        aria-label="Breadcrumbs"
      >
        {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
      </OverflowBreadcrumbs>
    ),
    [assessmentTitle],
  );

  if (!scenario) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack gap={0}>
          <PageHeader
            pageTitle="Scenario not found"
            breadcrumbs={breadcrumbs}
            slotProps={{
              backButton: {
                "aria-label": "Back",
                onClick: () =>
                  navigate(NEW_CRA_PATH, { state: { craReturnToScoring: true } }),
              },
            }}
          />
          <Typography variant="body1" sx={{ py: 4 }}>
            We could not find that scenario. Use the back control to return to scoring.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle="Scoring rationales"
          breadcrumbs={breadcrumbs}
          slotProps={{
            backButton: {
              "aria-label": "Back to scoring",
              onClick: () =>
                navigate(NEW_CRA_PATH, { state: { craReturnToScoring: true } }),
            },
          }}
        />

        <Stack gap={3} sx={{ pt: 3, pb: 6, width: "100%", maxWidth: "none" }}>
          <Typography
            component="h2"
            variant="h5"
            sx={({ tokens: t }) => ({
              m: 0,
              fontWeight: 600,
              color: t.semantic.color.type.default.value,
            })}
          >
            {scenario.tag}
          </Typography>

          <Box sx={{ "& p": { m: 0 } }}>
            <CraScenarioEmphasisTitle segments={scenario.titleSegments} />
          </Box>

          <Box
            sx={({ tokens: t }) => ({
              p: 3,
              borderRadius: t.semantic.radius.lg.value,
              bgcolor: t.semantic.color.surface.variant.value,
              border: "none",
              borderImage: "none",
            })}
          >
            <Stack direction="row" gap={2}>
              <ScoringMetricField label="Asset criticality" value={scenario.impact} />
              <ScoringMetricField label="Threat severity" value={scenario.threat} />
              <ScoringMetricField label="Vulnerability severity" value={scenario.vulnerability} />
              <ScoringMetricField label="Likelihood" value={scenario.likelihood} />
              <ScoringMetricField label="Cyber risk score" value={scenario.cyberRiskScore} />
            </Stack>
          </Box>

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scenario.rationale}
            onChange={() => {}}
            readOnly
            minRows={16}
            aria-label="Scoring rationale for this scenario"
          />
        </Stack>
      </Stack>
    </Container>
  );
}

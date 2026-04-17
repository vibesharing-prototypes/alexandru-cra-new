import { useCallback, useMemo, useState } from "react";
import {
  OverflowBreadcrumbs,
  PageHeader,
  SectionHeader,
} from "@diligentcorp/atlas-react-bundle";
import { Alert, AlertTitle, Box, Container, Stack, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NavLink, useLocation, useNavigate, useParams } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import ScenarioScoringDropdownsBlock from "../components/ScenarioScoringDropdownsBlock.js";
import type { ScenarioScoringInitialScores } from "../components/ScenarioScoringDropdownsBlock.js";
import {
  cyberRiskFromProduct,
  likelihoodFromProduct,
  SCORE_OPTIONS,
  type ScoreValue,
} from "../components/ScoringMetricField.js";
import {
  type AiScoringPhase,
  type CraScenarioDetailLocationState,
  type CraScoringTypeChoice,
  loadCraNewAssessmentDraft,
} from "./craNewAssessmentDraftStorage.js";
import { getScenarioById } from "../data/scenarios.js";

const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

export default function AssessmentScenarioDetailsPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = location.state as CraScenarioDetailLocationState | null;
  const assessmentNameFromNav = nav?.assessmentName;

  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const assessmentTitle = (assessmentNameFromNav ?? "").trim() || "New cyber risk assessment";

  const draft = loadCraNewAssessmentDraft();
  const scoringType: CraScoringTypeChoice = nav?.scoringType ?? draft?.scoringType ?? "residual";
  const aiScoringPhaseResolved: AiScoringPhase =
    nav?.aiScoringPhase ?? draft?.aiScoringPhase ?? "idle";

  const showDualScoringBlocks =
    scoringType === "inherent_residual" && aiScoringPhaseResolved === "complete";

  const initialScores = useMemo((): ScenarioScoringInitialScores => {
    if (!scenario) {
      return {
        impact: null,
        threat: null,
        vulnerability: null,
        likelihood: null,
        cyberRiskScore: null,
      };
    }
    return {
      impact: SCORE_OPTIONS[scenario.impact - 1] ?? null,
      threat: SCORE_OPTIONS[scenario.threatSeverity - 1] ?? null,
      vulnerability: SCORE_OPTIONS[scenario.vulnerabilitySeverity - 1] ?? null,
      likelihood: likelihoodFromProduct(scenario.likelihood),
      cyberRiskScore: cyberRiskFromProduct(scenario.cyberRiskScore),
    };
  }, [scenario]);

  const [scoringRationale, setScoringRationale] = useState(scenario?.scoringRationale ?? "");

  const appendScoringRationaleLine = useCallback((line: string) => {
    setScoringRationale((prev) => (prev.trim() ? `${line}\n\n${prev.trim()}` : line));
  }, []);

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

  const scoringBlocks = showDualScoringBlocks ? (
    <Stack sx={({ tokens: t }) => ({ gap: t.core.spacing["3"].value, width: "100%" })}>
      <ScenarioScoringDropdownsBlock
        key={`${scenario.id}-inherent`}
        title="Inherent scores"
        initialScores={initialScores}
        onAppendScoringRationale={appendScoringRationaleLine}
      />
      <ScenarioScoringDropdownsBlock
        key={`${scenario.id}-residual`}
        title="Residual scores"
        initialScores={initialScores}
        onAppendScoringRationale={appendScoringRationaleLine}
      />
    </Stack>
  ) : (
    <ScenarioScoringDropdownsBlock
      key={scenario.id}
      title="Scoring rationale"
      initialScores={initialScores}
      onAppendScoringRationale={appendScoringRationaleLine}
    />
  );

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
          <Alert
            severity="info"
            icon={<AiSparkleIcon />}
            aria-live="off"
            role={undefined}
            sx={{
              backgroundColor: "var(--lens-component-avatar-purple-background-color)",
              color: "var(--lens-component-accordion-active-color)",
              py: 2,
            }}
          >
            <Box sx={visuallyHidden}>AI</Box>
            <AlertTitle>Generated by Diligent Scoring AI</AlertTitle>
            The scoring and the rationale for this scenario were generated by the Diligent Scoring AI agent. Review the results and adjust as needed.
          </Alert>

          <SectionHeader
            title={scenario.id}
            subtitle={scenario.name}
            headingLevel="h2"
          />

          {scoringBlocks}

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scoringRationale}
            onChange={setScoringRationale}
            minRows={16}
            aria-label="Scoring rationale for this scenario"
          />
        </Stack>
      </Stack>
    </Container>
  );
}

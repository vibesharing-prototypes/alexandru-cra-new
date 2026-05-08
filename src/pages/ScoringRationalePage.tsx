import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { Alert, AlertTitle, Box, Container, Stack, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NavLink, useBeforeUnload, useLocation, useNavigate, useParams } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import ScoringRationaleHeader from "../components/ScoringRationaleHeader.js";
import ScoringWide from "../components/ScoringWide.js";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog.js";
import {
  type ScenarioHistoryEntry,
  ScenarioHistorySection,
} from "../components/ScenarioHistorySection.js";
import { buildScenarioHistorySnapshot } from "../components/ScenarioHistoryReadOnlyPanel.js";
import ScenarioScoringDropdownsBlock from "../components/ScenarioScoringDropdownsBlock.js";
import type { ScenarioScoringInitialScores } from "../components/ScenarioScoringDropdownsBlock.js";
import {
  cyberRiskFromProduct,
  likelihoodFromProduct,
  numericOf,
  SCORE_OPTIONS,
} from "../components/ScoringMetricField.js";
import {
  NEW_CRA_SCORING_TAB_INDEX,
  loadCraNewAssessmentDraft,
  saveCraNewAssessmentDraft,
  type CraScenarioDetailLocationState,
} from "./craNewAssessmentDraftStorage.js";
import {
  getCyberRiskScoreLabel,
  getFivePointLabel,
  getLikelihoodLabel,
  type FivePointScaleValue,
} from "../data/types.js";
import { getScenarioById, patchScenario } from "../data/scenarios.js";
import type { AssessmentScenario } from "../data/craAssessmentDraftTypes.js";
import type { MockScenario } from "../data/types.js";
import { users } from "../data/users.js";
import { getCatalogSnapshotVersion, subscribeCatalog } from "../data/persistence/catalogStore.js";
import {
  mergeSavedChangesNavigateState,
  useSavedChangesToast,
  type PendingSaveNavigationHandlers,
} from "../context/SavedChangesToastContext.js";

const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";

/** Prototype "current user" for save / scoring-override history rows. */
const SCENARIO_HISTORY_CURRENT_USER_NAME = users[0]!.fullName;
/** Example names for seeded baseline history entries. */
const SCENARIO_HISTORY_BASELINE_LATEST_OWNER = users[1]!.fullName;
const SCENARIO_HISTORY_BASELINE_PRIOR_OWNER = users[2]!.fullName;
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

// No longer needed - assessment scenarios accurately represent scored/unscored state

/**
 * Find an assessment scenario in the draft by its ID.
 * Assessment scenario IDs have format "ASC-{assessmentId}-{seq}".
 */
function getAssessmentScenarioFromDraft(
  draft: ReturnType<typeof loadCraNewAssessmentDraft>,
  scenarioId: string,
): AssessmentScenario | undefined {
  if (!draft?.assessmentScenarios) return undefined;
  return draft.assessmentScenarios.find((s) => s.id === scenarioId);
}

/**
 * Update an assessment scenario in the draft and save.
 */
function patchAssessmentScenario(
  scenarioId: string,
  patch: Partial<AssessmentScenario>,
): void {
  const draft = loadCraNewAssessmentDraft();
  if (!draft?.assessmentScenarios) return;

  const index = draft.assessmentScenarios.findIndex((s) => s.id === scenarioId);
  if (index === -1) return;

  draft.assessmentScenarios[index] = {
    ...draft.assessmentScenarios[index],
    ...patch,
  };

  saveCraNewAssessmentDraft(draft);
}

function scenarioScoresEqual(
  a: ScenarioScoringInitialScores,
  b: ScenarioScoringInitialScores,
): boolean {
  const fieldEqual = (
    x: ScenarioScoringInitialScores["impact"],
    y: ScenarioScoringInitialScores["impact"],
  ) => {
    if (x === y) return true;
    if (x == null || y == null) return x === y;
    return x.numeric === y.numeric && x.label === y.label && x.rag === y.rag;
  };
  return (
    fieldEqual(a.impact, b.impact) &&
    fieldEqual(a.threat, b.threat) &&
    fieldEqual(a.vulnerability, b.vulnerability) &&
    fieldEqual(a.likelihood, b.likelihood) &&
    fieldEqual(a.cyberRiskScore, b.cyberRiskScore)
  );
}

export default function ScoringRationalePage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifySavedChanges } = useSavedChangesToast();
  const nav = location.state as CraScenarioDetailLocationState | null;
  const assessmentNameFromNav = nav?.assessmentName;

  const catalogVersion = useSyncExternalStore(
    subscribeCatalog,
    getCatalogSnapshotVersion,
    getCatalogSnapshotVersion,
  );
  const persistedDraft = useMemo(() => loadCraNewAssessmentDraft(), [catalogVersion]);

  // Try to load assessment scenario first (if this is from an assessment), else fall back to catalog scenario
  const assessmentScenario = useMemo(
    () => (scenarioId && persistedDraft ? getAssessmentScenarioFromDraft(persistedDraft, scenarioId) : undefined),
    [scenarioId, persistedDraft],
  );
  const catalogScenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const scenario = assessmentScenario || catalogScenario;
  const isAssessmentScenario = assessmentScenario != null;

  const assessmentTitle = (assessmentNameFromNav ?? "").trim() || "New cyber risk assessment";

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
    // Assessment scenarios have nullable score fields
    const threatValue = scenario.threatSeverity != null ? SCORE_OPTIONS[scenario.threatSeverity - 1] : null;
    const vulnValue = scenario.vulnerabilitySeverity != null ? SCORE_OPTIONS[scenario.vulnerabilitySeverity - 1] : null;
    return {
      impact: SCORE_OPTIONS[scenario.impact - 1] ?? null,
      threat: threatValue ?? null,
      vulnerability: vulnValue ?? null,
      likelihood: scenario.likelihood != null ? likelihoodFromProduct(scenario.likelihood) : null,
      cyberRiskScore: scenario.cyberRiskScore != null ? cyberRiskFromProduct(scenario.cyberRiskScore) : null,
    };
  }, [scenario]);

  const [scoringRationale, setScoringRationale] = useState(
    () => scenario?.scoringRationale ?? "",
  );

  const [preEditHistoryEntries, setPreEditHistoryEntries] = useState<ScenarioHistoryEntry[]>([]);
  const [expandedHistoryEntryId, setExpandedHistoryEntryId] = useState<string | false>(false);
  const [liveScores, setLiveScores] = useState<ScenarioScoringInitialScores | null>(null);

  const scoringPageDirty = useMemo(() => {
    if (!scenario) return false;
    if (scoringRationale !== scenario.scoringRationale) return true;
    if (liveScores !== null && !scenarioScoresEqual(liveScores, initialScores)) return true;
    return false;
  }, [scenario, scoringRationale, liveScores, initialScores]);

  const pendingScoringNavigateRef = useRef<PendingSaveNavigationHandlers | null>(null);
  const [scoringUnsavedDialogOpen, setScoringUnsavedDialogOpen] = useState(false);

  const attemptScoringNavigate = useCallback(
    (handlers: PendingSaveNavigationHandlers) => {
      if (scoringPageDirty) {
        pendingScoringNavigateRef.current = handlers;
        setScoringUnsavedDialogOpen(true);
        return;
      }
      handlers.onDiscard();
    },
    [scoringPageDirty],
  );

  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (scoringPageDirty) {
          event.preventDefault();
        }
      },
      [scoringPageDirty],
    ),
  );

  const appendScoringRationaleLine = useCallback(
    (line: string, context: { previousScores: ScenarioScoringInitialScores }) => {
      if (!scenario) return;
      const id = `score-edit-${
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      }`;
      const snapshotBeforeEdit = buildScenarioHistorySnapshot(scenario as MockScenario, context.previousScores, {
        rationaleBody: scoringRationale,
      });
      setPreEditHistoryEntries((prev) => [
        {
          id,
          owner: SCENARIO_HISTORY_CURRENT_USER_NAME,
          at: new Date(),
          snapshot: snapshotBeforeEdit,
        },
        ...prev,
      ]);
      setScoringRationale((prev) => (prev.trim() ? `${line}\n\n${prev.trim()}` : line));
    },
    [scenario, scoringRationale],
  );

  const baselineHistoryEntries = useMemo((): ScenarioHistoryEntry[] => {
    if (!scenario) return [];
    const latest = buildScenarioHistorySnapshot(scenario as MockScenario, initialScores);
    const prior = buildScenarioHistorySnapshot(scenario as MockScenario, initialScores, {
      rationaleBody: scenario.scoringRationale.split(/\n\n/).slice(0, 3).join("\n\n"),
    });
    return [
      {
        id: "latest",
        owner: SCENARIO_HISTORY_BASELINE_LATEST_OWNER,
        at: new Date("2026-04-23T15:30:30"),
        snapshot: latest,
      },
      {
        id: "prior",
        owner: SCENARIO_HISTORY_BASELINE_PRIOR_OWNER,
        at: new Date("2026-04-22T10:00:00"),
        snapshot: prior,
      },
    ];
  }, [scenario, initialScores]);

  const historyEntries = useMemo(
    (): ScenarioHistoryEntry[] => [...preEditHistoryEntries, ...baselineHistoryEntries],
    [preEditHistoryEntries, baselineHistoryEntries],
  );

  /** Matches Details tab inherent/residual choice (via scoring tab navigation state). */
  const scenarioScoresBlockTitle =
    nav?.scoringType === "inherent" ? "Inherent scores" : "Residual scores";

  const breadcrumbs = useMemo(
    () => (
      <OverflowBreadcrumbs
        leadingElement={<span>Asset manager</span>}
        hideLastItem
        items={[
          { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_PATH },
          { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_PATH },
          {
            id: "assessment",
            label: assessmentTitle,
            url: nav?.returnToAssessmentPath?.trim() || NEW_CRA_PATH,
          },
        ]}
        aria-label="Breadcrumbs"
      >
        {({ label, url }) =>
          scoringPageDirty ? (
            <Typography
              component="button"
              type="button"
              variant="body1"
              onClick={() =>
                attemptScoringNavigate({
                  onDiscard: () => {
                    void navigate(url);
                  },
                  onAfterSave: () => {
                    void navigate(url, { state: mergeSavedChangesNavigateState(undefined) });
                  },
                })
              }
              sx={({ tokens: t }) => ({
                margin: 0,
                padding: 0,
                border: "none",
                background: "none",
                cursor: "pointer",
                font: "inherit",
                color: t.semantic.color.action.primary.default.value,
                textDecoration: "underline",
                textUnderlineOffset: "0.2em",
              })}
            >
              {label}
            </Typography>
          ) : (
            <NavLink to={url}>{label}</NavLink>
          )
        }
      </OverflowBreadcrumbs>
    ),
    [
      assessmentTitle,
      nav?.returnToAssessmentPath,
      scoringPageDirty,
      attemptScoringNavigate,
      navigate,
    ],
  );

  const goBackToScoring = useCallback(() => {
    const returnPath = nav?.returnToAssessmentPath?.trim() || NEW_CRA_PATH;
    const tabIndex = nav?.craReturnToTabIndex ?? NEW_CRA_SCORING_TAB_INDEX;
    const backState: CraScenarioDetailLocationState = { craReturnToTabIndex: tabIndex };
    attemptScoringNavigate({
      onDiscard: () => {
        navigate(returnPath, { state: backState });
      },
      onAfterSave: () => {
        navigate(returnPath, {
          state: mergeSavedChangesNavigateState(backState) as CraScenarioDetailLocationState,
        });
      },
    });
  }, [attemptScoringNavigate, navigate, nav?.returnToAssessmentPath, nav?.craReturnToTabIndex]);

  const persistScenarioChanges = useCallback(() => {
    if (!scenario) return;
    const scores = liveScores ?? initialScores;
    const id = `save-${
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    }`;
    const snapshot = buildScenarioHistorySnapshot(scenario as MockScenario, scores, {
      rationaleBody: scoringRationale,
    });
    setPreEditHistoryEntries((prev) => [
      {
        id,
        owner: SCENARIO_HISTORY_CURRENT_USER_NAME,
        at: new Date(),
        snapshot,
      },
      ...prev,
    ]);

    const impact = (scores.impact ? numericOf(scores.impact) : scenario.impact) as FivePointScaleValue;
    const threatSeverity = (scores.threat ? numericOf(scores.threat) : (scenario.threatSeverity ?? scenario.impact)) as FivePointScaleValue;
    const vulnerabilitySeverity = (scores.vulnerability
      ? numericOf(scores.vulnerability)
      : (scenario.vulnerabilitySeverity ?? scenario.impact)) as FivePointScaleValue;
    const likelihood = threatSeverity * vulnerabilitySeverity;
    const cyberRiskScore = impact * likelihood;

    const patch = {
      impact,
      impactLabel: getFivePointLabel(impact),
      threatSeverity,
      threatSeverityLabel: getFivePointLabel(threatSeverity),
      vulnerabilitySeverity,
      vulnerabilitySeverityLabel: getFivePointLabel(vulnerabilitySeverity),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(cyberRiskScore),
      scoringRationale: scoringRationale.trim(),
    };

    if (isAssessmentScenario) {
      // Update assessment scenario in draft
      patchAssessmentScenario(scenario.id, patch);
      const d = loadCraNewAssessmentDraft();
      const updated = getAssessmentScenarioFromDraft(d, scenario.id);
      if (updated) {
        setScoringRationale(updated.scoringRationale);
      }
    } else {
      // Update catalog scenario (old flow)
      patchScenario(scenario.id, patch);
      const updated = getScenarioById(scenario.id);
      if (updated) {
        setScoringRationale(updated.scoringRationale);
      }
    }
    setLiveScores(null);
  }, [scenario, liveScores, initialScores, scoringRationale, isAssessmentScenario, location.pathname]);

  const handleSave = useCallback(() => {
    persistScenarioChanges();
    notifySavedChanges();
  }, [persistScenarioChanges, notifySavedChanges]);

  const restoreScoringFormFromScenario = useCallback(() => {
    if (!scenario) return;
    setScoringRationale(scenario.scoringRationale);
    setLiveScores(null);
  }, [scenario]);

  const handleScoringUnsavedClose = useCallback(() => {
    pendingScoringNavigateRef.current = null;
    setScoringUnsavedDialogOpen(false);
  }, []);

  const handleScoringUnsavedDiscard = useCallback(() => {
    restoreScoringFormFromScenario();
    const pending = pendingScoringNavigateRef.current;
    pendingScoringNavigateRef.current = null;
    setScoringUnsavedDialogOpen(false);
    if (pending) {
      queueMicrotask(() => pending.onDiscard());
    }
  }, [restoreScoringFormFromScenario]);

  const handleScoringUnsavedSave = useCallback(() => {
    const pending = pendingScoringNavigateRef.current;
    pendingScoringNavigateRef.current = null;
    setScoringUnsavedDialogOpen(false);
    persistScenarioChanges();
    if (pending) {
      queueMicrotask(() => pending.onAfterSave());
    } else {
      notifySavedChanges();
    }
  }, [persistScenarioChanges, notifySavedChanges]);

  const scoringBlocks = scenario ? (
    <ScenarioScoringDropdownsBlock
      key={scenario.id}
      title={scenarioScoresBlockTitle}
      showBlockTitle
      initialScores={initialScores}
      onAppendScoringRationale={appendScoringRationaleLine}
      onScoresChange={setLiveScores}
    />
  ) : null;

  if (!scenario) {
    return (
      <Container sx={{ py: 2 }}>
        <Stack gap={0}>
          <ScoringRationaleHeader
            scenarioName="Scenario not found"
            scenarioId={scenarioId}
            breadcrumbs={breadcrumbs}
            onBack={goBackToScoring}
            backButtonAriaLabel="Back"
          />
          <Typography variant="body1" sx={{ py: 4 }}>
            We could not find that scenario. Use the back control to return to scoring.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={0}>
        <ScoringRationaleHeader
          scenarioName={scenario.name.trim() || scenario.id}
          scenarioId={scenario.id}
          breadcrumbs={breadcrumbs}
          onBack={goBackToScoring}
          backButtonAriaLabel="Back to scoring"
          onSave={handleSave}
        />

        <UnsavedChangesDialog
          open={scoringUnsavedDialogOpen}
          onClose={handleScoringUnsavedClose}
          onDiscard={handleScoringUnsavedDiscard}
          onSave={handleScoringUnsavedSave}
        />

        <Stack gap={3} sx={{ pt: 3, pb: 6, width: "100%", maxWidth: "none" }}>
          {scenario.threatSeverity != null && scenario.vulnerabilitySeverity != null ? (
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
          ) : null}

          <ScoringWide />

          {scoringBlocks}

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scoringRationale}
            onChange={setScoringRationale}
            minRows={16}
            semiboldLabelPrefixes
            aria-label="Scoring rationale for this scenario"
          />

          <ScenarioHistorySection
            scenarioId={scenario.id}
            entries={historyEntries}
            expandedEntryId={expandedHistoryEntryId}
            onExpandedEntryChange={setExpandedHistoryEntryId}
          />
        </Stack>
      </Stack>
    </Container>
  );
}

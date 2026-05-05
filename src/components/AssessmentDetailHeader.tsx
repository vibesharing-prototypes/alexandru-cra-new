import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import {
  assessmentStatusFromDisplayLabel,
  assessmentStatusLabel,
} from "../data/assessmentStatusLabels.js";
import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";
import {
  assessmentPhaseToAssessmentStatus,
  type AiScoringPhase,
  type AssessmentPhase,
} from "../pages/craNewAssessmentDraftStorage.js";
import AssessmentStatus, {
  assessmentStatusDotBackground,
} from "./AssessmentStatus.js";
import MetaTag from "./MetaTag.js";
import StatusDropdown, { type LensTokens } from "./StatusDropdown.js";
import {
  mergeSavedChangesNavigateState,
  type PendingSaveNavigationHandlers,
} from "../context/SavedChangesToastContext.js";
import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

const ASSESSMENTS_URL = "/cyber-risk/cyber-risk-assessments";

export type ScopeDetailNavigateHandlers = PendingSaveNavigationHandlers;

const SCOPE_TAB_INDEX = 1;
const SCORING_TAB_INDEX = 2;
const RESULTS_TAB_INDEX = 3;

const TAB_LABELS = ["Details", "Scope", "Scoring", "Results"] as const;

/** Menu order for the status dropdown; Approved is last. */
const STATUS_DROPDOWN_ORDER: readonly AssessmentStatusValue[] = [
  "Draft",
  "Scoping",
  "Scoring",
  "Review",
  "Overdue",
  "Approved",
];

const STATUS_DROPDOWN_OPTIONS = STATUS_DROPDOWN_ORDER.map(assessmentStatusLabel);

const ASSESSMENT_HEADER_MORE_MENU_ID = "cra-assessment-header-more-menu";

/** Random system-style id `CRA-NNN` (001–999), stable for the lifetime of the header instance. */
function randomCraStyleId(): string {
  const n = Math.floor(Math.random() * 999) + 1;
  return `CRA-${String(n).padStart(3, "0")}`;
}

export type AssessmentDetailHeaderProps = {
  /** Assessment display name (used in breadcrumb + page title). */
  assessmentName: string;
  /** User-defined assessment code from details; shown as Custom ID. */
  assessmentId: string;
  dueDate: string;
  /** Display string for when the assessment was created. */
  createdAtDisplay: string;
  /** Display name of the created-by user. */
  createdBy: string;
  /** Display string for last update time. */
  lastUpdatedAtDisplay: string;
  /** Display name of the user who last updated the assessment. */
  lastUpdatedByDisplay: string;
  assessmentPhase: AssessmentPhase;
  onPhaseChange: (phase: AssessmentPhase) => void;
  activeTab: number;
  onActiveTabChange: (tab: number) => void;
  /** When provided, the header switches to scope-detail mode (nested breadcrumb, back button returns to overview). */
  scopeDetail?: { title: string; subtitle: string; crumb: string };
  /** Called when the back button is pressed in scope-detail mode (return to scope overview). */
  onScopeSubViewBack: () => void;
  /** Called when "Save changes" is pressed in scope-detail mode (returns to scope overview). */
  onScopeDetailDone: () => void;
  /** When true, breadcrumb navigations out of the assessment prompt for unsaved scope edits. */
  scopeDetailHasUnsavedChanges?: boolean;
  /** Intercept breadcrumb navigation while scope detail has unsaved changes; run discard vs after-save navigation. */
  onScopeDetailNavigateRequest?: (handlers: ScopeDetailNavigateHandlers) => void;
  /** Primary Save action (main header only; not shown in scope-detail mode). */
  onSave?: () => void;
  /** When the assessment is approved, called from the header "Export results" action. */
  onExportResults?: () => void;
  /** When scoring/overdue, controls when the header shows "Approve assessment" (after AI run completes). */
  aiScoringPhase?: AiScoringPhase;
  /** After "Revert to scoring" (approved → scoring); e.g. reset scenario score aggregation to default. */
  onResetScores?: () => void;
  /** Overflow menu: Reassess (optional no-op hook). */
  onReassess?: () => void;
  /** When set, overflow menu shows Delete (destructive); parent removes catalog row and navigates. */
  onDeletePersistedAssessment?: () => void;
};

export default function AssessmentDetailHeader({
  assessmentName,
  assessmentId,
  dueDate,
  createdAtDisplay,
  createdBy,
  lastUpdatedAtDisplay,
  lastUpdatedByDisplay,
  assessmentPhase,
  onPhaseChange,
  activeTab,
  onActiveTabChange,
  scopeDetail,
  onScopeSubViewBack,
  onScopeDetailDone,
  scopeDetailHasUnsavedChanges = false,
  onScopeDetailNavigateRequest,
  onSave,
  onExportResults,
  aiScoringPhase = "complete",
  onResetScores,
  onReassess,
  onDeletePersistedAssessment,
}: AssessmentDetailHeaderProps) {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const generatedSystemIdRef = useRef("");
  if (!generatedSystemIdRef.current) {
    generatedSystemIdRef.current = randomCraStyleId();
  }
  const systemIdDisplay = generatedSystemIdRef.current;

  const pageDisplayTitle = assessmentName.trim() || "New cyber risk assessment";
  const phaseDisplayLabel = assessmentStatusLabel(
    assessmentPhaseToAssessmentStatus(assessmentPhase),
  );

  const metaRowInset = `calc(${tokens.component.button.iconOnly.medium.width.value} + ${tokens.component.pageHeader.desktop.mainContent.gap.value})`;

  const breadcrumbs = (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      items={[
        { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_URL },
        { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_URL },
      ]}
      aria-label="Breadcrumbs"
    >
      {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
    </OverflowBreadcrumbs>
  );

  const scopeDetailBreadcrumbs = scopeDetail ? (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      hideLastItem
      items={[
        { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_URL },
        { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_URL },
        {
          id: "assessment",
          label: pageDisplayTitle,
          url: ASSESSMENTS_URL,
        },
        { id: "scope_detail", label: scopeDetail.crumb, url: "#" },
      ]}
      aria-label="Breadcrumbs"
    >
      {({ label, url }) =>
        url === "#" ? (
          <Typography component="span" variant="body1">
            {label}
          </Typography>
        ) : scopeDetailHasUnsavedChanges && onScopeDetailNavigateRequest ? (
          <Typography
            component="button"
            type="button"
            variant="body1"
            onClick={() =>
              onScopeDetailNavigateRequest({
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
  ) : null;

  const ctaLabel =
    assessmentPhase === "draft"
      ? "Move to scoping"
      : assessmentPhase === "scoping"
        ? "Move to scoring"
        : assessmentPhase === "inProgress" || assessmentPhase === "overdue"
          ? "Review results"
          : assessmentPhase === "review"
            ? "Approve assessment"
            : "Done";

  const hideCta =
    (assessmentPhase === "inProgress" || assessmentPhase === "overdue") &&
    aiScoringPhase !== "complete";

  const approveAssessmentClick = () => {
    onPhaseChange("assessmentApproved");
    onActiveTabChange(RESULTS_TAB_INDEX);
  };

  const handleCloseMoreMenu = () => {
    setMoreMenuOpen(false);
  };

  const headerOverflowMenu = (
    <>
      <IconButton
        ref={moreButtonRef}
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={moreMenuOpen}
        aria-controls={moreMenuOpen ? ASSESSMENT_HEADER_MORE_MENU_ID : undefined}
        size="medium"
        color="inherit"
        onClick={() => setMoreMenuOpen(true)}
        sx={({ tokens: t }) => ({
          color: t.semantic.color.type.default.value,
          "&:hover": {
            backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
          },
        })}
      >
        <MoreIcon aria-hidden />
      </IconButton>
      <Menu
        anchorEl={moreButtonRef.current}
        open={moreMenuOpen}
        onClose={handleCloseMoreMenu}
        slotProps={{
          list: {
            id: ASSESSMENT_HEADER_MORE_MENU_ID,
            role: "menu",
            "aria-label": "More actions",
          },
        }}
      >
        <MenuItem
          role="menuitem"
          onClick={() => {
            onReassess?.();
            handleCloseMoreMenu();
          }}
        >
          Reassess
        </MenuItem>
        {onDeletePersistedAssessment ? (
          <MenuItem
            role="menuitem"
            onClick={() => {
              onDeletePersistedAssessment();
              handleCloseMoreMenu();
            }}
            sx={({ tokens: t }) => ({
              color: t.semantic.color.action.destructive.default.value,
            })}
          >
            Delete
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );

  const singleWorkflowCta = hideCta ? null : (
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={() => {
          if (assessmentPhase === "draft") {
            onPhaseChange("scoping");
            onActiveTabChange(SCOPE_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "scoping") {
            onPhaseChange("inProgress");
            onActiveTabChange(SCORING_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "inProgress" || assessmentPhase === "overdue") {
            onPhaseChange("review");
            onActiveTabChange(RESULTS_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "review") {
            setApproveConfirmOpen(true);
            return;
          }
        }}
      >
        {ctaLabel}
      </Button>
    );

  const approvedActions =
    assessmentPhase === "assessmentApproved" ? (
      <>
        <Button
          variant="text"
          color="primary"
          size="medium"
          startIcon={<DownloadIcon aria-hidden />}
          aria-label="Export assessment results"
          onClick={() => {
            onExportResults?.();
          }}
        >
          Export results
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={() => {
            onPhaseChange("inProgress");
            onActiveTabChange(SCORING_TAB_INDEX);
            onResetScores?.();
          }}
        >
          Revert to scoring
        </Button>
        {headerOverflowMenu}
      </>
    ) : null;

  const defaultMoreButton = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={({ tokens: t }) => ({
          gap: t.core.spacing["2"].value,
          flexShrink: 0,
        })}
      >
        {onSave ? (
          <Button variant="text" size="medium" onClick={onSave}>
            Save changes
          </Button>
        ) : null}
        {approvedActions ?? (
          <>
            {singleWorkflowCta}
            {headerOverflowMenu}
          </>
        )}
      </Stack>
    </Box>
  );

  const scopeDetailMoreButton = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Button variant="text" size="medium" onClick={onScopeDetailDone}>
        Save changes
      </Button>
    </Box>
  );

  return (
    <Stack
      component="section"
      aria-label="Assessment detail header"
      spacing={0}
      sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}
    >
      <PageHeader
        containerProps={{
          sx: {
            marginBottom: tokens.core.spacing["0_5"].value,
          },
        }}
        pageTitle={scopeDetail ? scopeDetail.title : pageDisplayTitle}
        pageSubtitle={scopeDetail ? scopeDetail.subtitle : undefined}
        breadcrumbs={scopeDetailBreadcrumbs ?? breadcrumbs}
        statusIndicator={
          scopeDetail ? undefined : (
            <StatusDropdown
              value={phaseDisplayLabel}
              options={[...STATUS_DROPDOWN_OPTIONS]}
              aria-label="Assessment status"
              resolveDotFill={(label, t: LensTokens) =>
                assessmentStatusDotBackground(
                  assessmentStatusFromDisplayLabel(label) ?? "Draft",
                  t,
                )
              }
              renderChip={({ value: v }) => (
                <AssessmentStatus
                  status={assessmentStatusFromDisplayLabel(v) ?? "Draft"}
                />
              )}
            />
          )
        }
        moreButton={scopeDetail ? scopeDetailMoreButton : defaultMoreButton}
        slotProps={
          scopeDetail
            ? {
                backButton: {
                  "aria-label": "Back to scope overview",
                  onClick: onScopeSubViewBack,
                },
              }
            : {
                backButton: {
                  "aria-label": "Back to assessments",
                  onClick: () => navigate(ASSESSMENTS_URL),
                },
              }
        }
      />

      {!scopeDetail ? (
        <Stack
          direction="row"
          component="div"
          flexWrap="wrap"
          gap={1}
          sx={{
            alignItems: "center",
            marginBottom: tokens.core.spacing["2"].value,
            paddingInlineStart: metaRowInset,
          }}
        >
          <MetaTag label="ID" value={systemIdDisplay} />
          <MetaTag label="Custom ID" value={assessmentId.trim() || "—"} />
          <MetaTag label="Due date" value={dueDate || "—"} />
          <MetaTag label="Created" value={createdAtDisplay || "—"} />
          <MetaTag label="Created by" value={createdBy || "—"} />
          <MetaTag label="Last updated" value={lastUpdatedAtDisplay || "—"} />
          <MetaTag label="Last updated by" value={lastUpdatedByDisplay || "—"} />
        </Stack>
      ) : null}

      {!scopeDetail ? (
        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => {
            onActiveTabChange(v);
          }}
          className="atlas-size-large"
          aria-label="Cyber risk assessment sections"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={atlasPageHeaderTabsSlotProps}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasPageHeaderNavigationTabsSx,
          }}
        >
          {TAB_LABELS.map((label, index) => (
            <Tab
              key={`${label}-${index}`}
              label={label}
              id={`new-cra-tab-${index}`}
              aria-controls={`new-cra-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      ) : null}

      <Dialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        aria-labelledby="approve-assessment-dialog-title"
        aria-describedby="approve-assessment-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
          <h2 id="approve-assessment-dialog-title">Approve assessment</h2>
          <IconButton
            aria-label="Close"
            onClick={() => setApproveConfirmOpen(false)}
            color="inherit"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="approve-assessment-dialog-description">
            After approving you will not be able to make changes to the assessment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setApproveConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            autoFocus
            onClick={() => {
              approveAssessmentClick();
              setApproveConfirmOpen(false);
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

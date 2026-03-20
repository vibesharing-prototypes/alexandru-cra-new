import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import NewCyberRiskAssessmentMethodSection from "./NewCyberRiskAssessmentMethodSection.js";
import NewCyberRiskAssessmentScoringTab from "./NewCyberRiskAssessmentScoringTab.js";
import NewCyberRiskAssessmentResultsTab from "./NewCyberRiskAssessmentResultsTab.js";
import NewCyberRiskAssessmentScopeTab from "./NewCyberRiskAssessmentScopeTab.js";

const TAB_LABELS = ["Details", "Scope", "Scoring", "Results"] as const;

const SCORING_TAB_INDEX = 2;
const RESULTS_TAB_INDEX = 3;

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`new-cra-tabpanel-${index}`}
      aria-labelledby={`new-cra-tab-${index}`}
    >
      {value === index ? children : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={({ tokens: t }) => ({
        fontSize: 26,
        fontWeight: 600,
        lineHeight: "34px",
        color: t.semantic.color.type.default.value,
      })}
    >
      {children}
    </Typography>
  );
}

export default function NewCyberRiskAssessmentPage() {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const [activeTab, setActiveTab] = useState(0);
  /** When true, assessment is in progress: Scoring is enabled and status shows In progress. */
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [name, setName] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle={
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{
                gap: tokens.component.pageHeader.desktop.statusContainer.gap.value,
                minWidth: 0,
                width: "100%",
              }}
            >
              <Typography
                component="h1"
                variant="h1"
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: tokens.component.pageHeader.desktop.title.fontWeight.value,
                }}
              >
                {name.trim() || "New cyber risk assessment"}
              </Typography>
              <Box sx={{ marginBottom: "auto", marginTop: 0.5, flexShrink: 0 }}>
                {assessmentInProgress ? (
                  <StatusIndicator
                    color="information"
                    sx={{ display: "flex" }}
                    label="In progress"
                    aria-label="Assessment status: In progress"
                  />
                ) : (
                  <StatusIndicator
                    customColor={({ semantic }) => ({
                      backgroundColor: semantic.color.status.neutral.backgroundVariant.value,
                      color: semantic.color.status.neutral.text.value,
                    })}
                    sx={{ display: "flex" }}
                    label="Draft"
                    aria-label="Assessment status: Draft"
                  />
                )}
              </Box>
            </Stack>
          }
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset manager</span>}
              items={[
                {
                  id: "crm",
                  label: "Cyber risk management",
                  url: "/cyber-risk/cyber-risk-assessments",
                },
                {
                  id: "cra",
                  label: "Cyber risk analysis",
                  url: "/cyber-risk/cyber-risk-assessments",
                },
              ]}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          moreButton={
            <Button
              variant="contained"
              size="medium"
              onClick={() => {
                if (!assessmentInProgress) {
                  setAssessmentInProgress(true);
                  setActiveTab(SCORING_TAB_INDEX);
                  return;
                }
                navigate("/cyber-risk/cyber-risk-assessment");
              }}
            >
              {assessmentInProgress ? "Conclude assessment" : "Move to assessment"}
            </Button>
          }
        />

        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => {
            if (v === SCORING_TAB_INDEX && !assessmentInProgress) return;
            if (v === RESULTS_TAB_INDEX && !assessmentInProgress) return;
            setActiveTab(v);
          }}
          aria-label="New cyber risk assessment steps"
          {...TabsPresets.Tabs.alignToPageHeader}
          sx={[
            TabsPresets.Tabs.alignToPageHeader?.sx,
            { "& .MuiTabs-flexContainer": { gap: 0 } },
          ]}
        >
          {TAB_LABELS.map((label, index) => {
            const scoringLocked = index === SCORING_TAB_INDEX && !assessmentInProgress;
            const resultsLocked = index === RESULTS_TAB_INDEX && !assessmentInProgress;
            const tabDisabled = scoringLocked || resultsLocked;
            return (
              <Tab
                key={`${label}-${index}`}
                label={label}
                id={`new-cra-tab-${index}`}
                aria-controls={`new-cra-tabpanel-${index}`}
                disabled={tabDisabled}
                sx={
                  tabDisabled
                    ? ({ tokens: t }) => ({
                        color: `${t.semantic.color.type.muted.value} !important`,
                      })
                    : undefined
                }
              />
            );
          })}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Stack gap={6} sx={{ pt: 3, pb: 4, maxWidth: 1280 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              flexWrap="wrap"
              alignItems={{ xs: "stretch", md: "flex-end" }}
            >
              <Box sx={{ flex: { md: "7 1 0" }, minWidth: { xs: "100%", md: 280 } }}>
                <Stack gap={1}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Assessment name"
                    aria-label="Assessment name"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "2 1 0" }, minWidth: { xs: "100%", md: 120 } }}>
                <Stack gap={1}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      ID
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.muted.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      (Required)
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    value={assessmentId}
                    onChange={(e) => setAssessmentId(e.target.value)}
                    placeholder="e.g. CRA-001"
                    aria-label="Assessment ID"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "3 1 0" }, minWidth: { xs: "100%", md: 200 } }}>
                <FormControl fullWidth>
                  <InputLabel id="assessment-type-label" size="small">
                    Assessment type
                  </InputLabel>
                  <Select
                    labelId="assessment-type-label"
                    label="Assessment type"
                    size="small"
                    displayEmpty
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={({ tokens: t }) => ({
                            color: t.semantic.color.type.muted.value,
                          })}
                        >
                          Select assessment type
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value="Cyber risk assessment">Cyber risk assessment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Stack gap={2}>
              <SectionHeading>Scheduling</SectionHeading>
              <Stack direction={{ xs: "column", sm: "row" }} gap={3} flexWrap="wrap">
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Start date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. 02 Feb 2026"
                      aria-label="Start date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                aria-label="Clear start date"
                                onClick={() => setStartDate("")}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Due date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="e.g. 23 Aug 2026"
                      aria-label="Due date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                aria-label="Clear due date"
                                onClick={() => setDueDate("")}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Stack>

            <NewCyberRiskAssessmentMethodSection />
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <NewCyberRiskAssessmentScopeTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <NewCyberRiskAssessmentScoringTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <NewCyberRiskAssessmentResultsTab />
        </TabPanel>
      </Stack>
    </Container>
  );
}

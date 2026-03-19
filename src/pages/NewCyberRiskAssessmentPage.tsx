import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
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
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import NewCyberRiskAssessmentMethodTab from "./NewCyberRiskAssessmentMethodTab.js";
import NewCyberRiskAssessmentScoringTab from "./NewCyberRiskAssessmentScoringTab.js";
import NewCyberRiskAssessmentScopeTab from "./NewCyberRiskAssessmentScopeTab.js";

const TAB_LABELS = [
  "Details",
  "Scope",
  "Assessment method",
  "Scoring",
  "Results",
] as const;

type Assessor = {
  id: string;
  name: string;
  initials: string;
  avatarColor: "green" | "red" | "blue";
};

const ASSESSOR_OPTIONS: Assessor[] = [
  { id: "1", name: "Mark Rhodes", initials: "MR", avatarColor: "green" },
  { id: "2", name: "Marcella Johnson", initials: "MJ", avatarColor: "red" },
  { id: "3", name: "Alex Chen", initials: "AC", avatarColor: "blue" },
];

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

function PlaceholderTab({ label }: { label: string }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        py: 6,
        display: "flex",
        justifyContent: "center",
        color: t.semantic.color.type.muted.value,
      })}
    >
      <Typography variant="body1">{label} content</Typography>
    </Box>
  );
}

export default function NewCyberRiskAssessmentPage() {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;
  const { getAvatarProps } = presets.AvatarPresets;

  const [activeTab, setActiveTab] = useState(0);
  /** When true, assessment is in progress: Scoring is enabled and status shows In progress. */
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [name, setName] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
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
                  setActiveTab(3);
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
            if (v >= 4) return;
            if (v === 3 && !assessmentInProgress) return;
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
            const scoringLocked = index === 3 && !assessmentInProgress;
            const resultsLocked = index === 4;
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
          <Stack gap={4} sx={{ pt: 3, pb: 4 }}>
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
              <SectionHeading>Assessors</SectionHeading>
              <Stack gap={1}>
                <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Assessors
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
                <Autocomplete
                  multiple
                  options={ASSESSOR_OPTIONS}
                  value={assessors}
                  onChange={(_e, v) => setAssessors(v)}
                  getOptionLabel={(o) => o.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, i) => {
                      const tagProps = getTagProps({ index: i });
                      return (
                        <Chip
                          {...tagProps}
                          key={option.id}
                          label={
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Avatar
                                {...getAvatarProps({
                                  size: "small",
                                  color: "blue",
                                })}
                                sx={({ tokens: t }) => ({
                                  width: 24,
                                  height: 24,
                                  fontSize: 11,
                                  ...(option.avatarColor === "green" && {
                                    bgcolor: t.semantic.color.accent.green.background.value,
                                  }),
                                  ...(option.avatarColor === "red" && {
                                    bgcolor: t.semantic.color.accent.red.background.value,
                                  }),
                                  ...(option.avatarColor === "blue" && {
                                    bgcolor: t.semantic.color.surface.variant.value,
                                  }),
                                })}
                              >
                                {option.initials}
                              </Avatar>
                              <Typography variant="caption">{option.name}</Typography>
                            </Stack>
                          }
                          onDelete={tagProps.onDelete}
                          deleteIcon={<CloseIcon aria-hidden />}
                          variant="outlined"
                          sx={{ height: 32, "& .MuiChip-label": { px: 1 } }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search and add assessors"
                      aria-label="Assessors"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              <IconButton
                                size="small"
                                aria-label="Clear assessors"
                                onClick={() => setAssessors([])}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open assessor options">
                                <ExpandDownIcon aria-hidden />
                              </IconButton>
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>

            <Stack gap={3}>
              <Box>
                <Typography
                  component="h3"
                  sx={({ tokens: t }) => ({
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: "28px",
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  Message
                </Typography>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    display: "block",
                    mt: 0.5,
                    color: t.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                    maxWidth: "none",
                  })}
                >
                  You can help increase assessor response rate by writing a customized
                  introduction and message.
                </Typography>
              </Box>

              <Stack gap={1}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                  })}
                >
                  Subject
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  aria-label="Email subject"
                />
              </Stack>

              <AssessmentWysiwygEditor
                fieldId="new-cra-email-body"
                label="E-mail message"
                required
                placeholder="Write your message to assessors…"
                value={emailBody}
                onChange={setEmailBody}
                minRows={10}
                aria-label="Email message body"
              />
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
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <NewCyberRiskAssessmentScopeTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <NewCyberRiskAssessmentMethodTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <NewCyberRiskAssessmentScoringTab />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <PlaceholderTab label="Results" />
        </TabPanel>
      </Stack>
    </Container>
  );
}

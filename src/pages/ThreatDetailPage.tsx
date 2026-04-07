import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import StatusDropdown from "../components/StatusDropdown.js";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import CloudIcon from "@diligentcorp/atlas-react-bundle/icons/Cloud";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

import type {
  MockThreatAttachment,
  ThreatActor,
  ThreatAttackVector,
  ThreatDomain,
  ThreatSource,
  ThreatStatus,
} from "../data/types.js";
import {
  THREAT_ACTOR_OPTIONS,
  THREAT_ATTACK_VECTOR_OPTIONS,
  THREAT_SOURCE_OPTION_DETAILS,
} from "../data/types.js";
import { getThreatById } from "../data/threats.js";
import { getUserById, users } from "../data/users.js";
import {
  atlasNavigationTabsSlotProps,
  atlasNavigationTabsSx,
} from "../utils/atlasNavigationTabsSx.js";

const THREAT_STATUSES: ThreatStatus[] = ["Draft", "Active", "Archived"];

const THREAT_DOMAINS: ThreatDomain[] = [
  "Identity & Access Management",
  "Endpoint & Device",
  "Network & Infrastructure",
  "Application & API",
  "Data & Information",
  "Cloud & Virtualisation",
  "Physical & Facilities",
  "Supply Chain & Third Party",
  "Operational Technology (OT/ICS)",
  "People & Workforce",
];

/** Keeps labels readable (sentence case, no theme small-caps). */
const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

function formatDetailDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

interface MultiComboBoxOption {
  value: string;
  label: string;
}

interface MultiComboBoxProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiComboBoxOption[];
}

function MultiComboBox({ label, value, onChange, options }: MultiComboBoxProps) {
  const { tokens } = useTheme();

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx}>{label}</InputLabel>
      <Select
        multiple
        displayEmpty
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as string[])}
        renderValue={(selected) => {
          const vals = selected as string[];
          if (vals.length === 0) {
            return (
              <Box
                component="span"
                sx={{
                  color: tokens.semantic.color.type.muted.value,
                  pointerEvents: "none",
                }}
              >
                Choose multiple options
              </Box>
            );
          }
          const labels = vals.map((v) => options.find((o) => o.value === v)?.label ?? v);
          if (vals.length === 1) return labels[0];
          return (
            <>
              <Box component="span" sx={{ mr: 0.5 }}>
                ({vals.length})
              </Box>
              {labels.join(", ")}
            </>
          );
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            <Checkbox checked={value.includes(o.value)} size="small" disableRipple />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function ThreatDetailPage() {
  const { threatId } = useParams<{ threatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { presets } = useTheme();
  const { TabsPresets } = presets;

  const threat = threatId ? getThreatById(threatId) : undefined;

  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [displayId, setDisplayId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [sources, setSources] = useState<ThreatSource[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [attackVectors, setAttackVectors] = useState<ThreatAttackVector[]>([]);
  const [status, setStatus] = useState<ThreatStatus>("Draft");
  const [domain, setDomain] = useState<ThreatDomain>("Identity & Access Management");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<MockThreatAttachment[]>([]);

  useEffect(() => {
    if (!threat) return;
    setName(threat.name);
    setDisplayId(threat.displayId);
    setOwnerId(threat.ownerId);
    setSources([...threat.sources]);
    setThreatActors([...threat.threatActors]);
    setAttackVectors([...threat.attackVectors]);
    setStatus(threat.status);
    setDomain(threat.domain);
    setDescription(threat.description);
    setAttachments([...threat.attachments]);
  }, [threat]);

  useEffect(() => {
    setTab(0);
  }, [threatId]);

  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const st = location.state as { showCreatedToast?: boolean } | null;
    if (st?.showCreatedToast) {
      setToastOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const metaNow = useMemo(() => formatDetailDate(new Date()), []);
  const createdBy = getUserById(ownerId)?.fullName ?? "—";

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const toastAction = (
    <Button variant="text" size="medium" onClick={handleToastClose}>
      <CloseIcon aria-label="Dismiss notification" />
    </Button>
  );

  if (!threatId || !threat) {
    return <Navigate to="/cyber-risk/threats" replace />;
  }

  const pageTitleText = name.trim() || threat.name;

  return (
    <Container sx={{ py: 2, pb: 4 }} maxWidth={false}>
      <Stack gap={2}>
        <PageHeader
          pageTitle={pageTitleText}
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset manager</span>}
              items={[
                { id: "threats", label: "Threats", url: "/cyber-risk/threats" },
                { id: "detail", label: pageTitleText, url: "#" },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) =>
                url === "#" ? (
                  <Typography component="span" variant="inherit">
                    {label}
                  </Typography>
                ) : (
                  <NavLink to={url}>{label}</NavLink>
                )
              }
            </OverflowBreadcrumbs>
          }
          statusIndicator={
            <StatusDropdown
              value={status}
              options={THREAT_STATUSES}
              onChange={(v) => setStatus(v as ThreatStatus)}
              aria-label="Threat status"
            />
          }
          moreButton={
            <Stack direction="row" alignItems="center" gap={1}>
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={({ tokens }) => ({
                  color: tokens.semantic.color.type.muted.value,
                })}
              >
                <CloudIcon aria-hidden />
                <Typography variant="textSm">Saved</Typography>
              </Stack>
              <IconButton aria-label="More actions" size="small">
                <MoreIcon aria-hidden />
              </IconButton>
            </Stack>
          }
          slotProps={{
            backButton: {
              "aria-label": "Back to threats",
              onClick: () => navigate("/cyber-risk/threats"),
            },
          }}
        />

        <Typography
          variant="textSm"
          component="div"
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type.muted.value,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            rowGap: 0.5,
          })}
        >
          <span>Threat ID (meta): {threat.id}</span>
          <span>Display ID: {displayId || "—"}</span>
          <span>Created: {metaNow}</span>
          <span>Created by: {createdBy}</span>
          <span>Last updated: {metaNow}</span>
          <span>Last updated by: {createdBy}</span>
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          className="atlas-size-large"
          aria-label="Threat sections"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={atlasNavigationTabsSlotProps}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasNavigationTabsSx,
          }}
        >
          <Tab label="Details" id="threat-tab-0" aria-controls="threat-panel-0" />
          <Tab label="Relationships" id="threat-tab-1" aria-controls="threat-panel-1" />
          <Tab label="Threat intel" id="threat-tab-2" aria-controls="threat-panel-2" />
          <Tab label="Assessments" id="threat-tab-3" aria-controls="threat-panel-3" />
        </Tabs>

        {tab === 0 && (
          <Box
            role="tabpanel"
            id="threat-panel-0"
            aria-labelledby="threat-tab-0"
            sx={{ pt: 2 }}
          >
            <Stack spacing={3}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Box sx={{ flex: { md: "3 1 0" }, minWidth: 0 }}>
                    <FormControl fullWidth sx={{ gap: 0 }} required>
                      <FormLabel htmlFor="threat-detail-name" sx={fieldLabelSx}>
                        Threat name
                      </FormLabel>
                      <TextField
                        id="threat-detail-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Short, recognisable label"
                        fullWidth
                        required
                        margin="none"
                        sx={{ mt: 0 }}
                      />
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: { md: "1 1 200px" }, minWidth: 0 }}>
                    <FormControl fullWidth sx={{ gap: 0 }}>
                      <FormLabel htmlFor="threat-detail-meta-id" sx={fieldLabelSx}>
                        Custom ID
                      </FormLabel>
                      <TextField
                        id="threat-detail-meta-id"
                        value={threat.id}
                        fullWidth
                        margin="none"
                        sx={{ mt: 0 }}
                      />
                    </FormControl>
                  </Box>
                </Stack>
              </Stack>

              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                    <FormControl fullWidth margin="none">
                      <InputLabel id="threat-domain-label" sx={fieldLabelSx}>
                        Threat domain
                      </InputLabel>
                      <Select
                        labelId="threat-domain-label"
                        value={domain}
                        label="Threat domain"
                        onChange={(e) => setDomain(e.target.value as ThreatDomain)}
                      >
                        {THREAT_DOMAINS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                    <MultiComboBox
                      label="Threat source type"
                      value={sources}
                      onChange={(v) => setSources(v as ThreatSource[])}
                      options={THREAT_SOURCE_OPTION_DETAILS.map((o) => ({
                        value: o.value,
                        label: o.caption,
                      }))}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                    <MultiComboBox
                      label="Threat actor"
                      value={threatActors}
                      onChange={(v) => setThreatActors(v as ThreatActor[])}
                      options={THREAT_ACTOR_OPTIONS.map((a) => ({ value: a, label: a }))}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                    <MultiComboBox
                      label="Attack vector"
                      value={attackVectors}
                      onChange={(v) => setAttackVectors(v as ThreatAttackVector[])}
                      options={THREAT_ATTACK_VECTOR_OPTIONS.map((v) => ({ value: v, label: v }))}
                    />
                  </Box>
                </Stack>

                <FormControl fullWidth sx={{ gap: 0 }}>
                  <FormLabel htmlFor="threat-detail-description" sx={fieldLabelSx}>
                    Description
                  </FormLabel>
                  <TextField
                    id="threat-detail-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What the threat is, how it manifests, and what it targets"
                    fullWidth
                    margin="none"
                    multiline
                    minRows={4}
                    sx={{ mt: 0 }}
                  />
                </FormControl>
              </Stack>

              <Stack spacing={2}>
                <FormControl fullWidth margin="none" sx={{ maxWidth: { md: 480 } }}>
                  <InputLabel id="threat-owner-label" sx={fieldLabelSx}>
                    Owner
                  </InputLabel>
                  <Select
                    labelId="threat-owner-label"
                    value={ownerId}
                    label="Owner"
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    {users.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.fullName} ({u.id})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Accountable for periodic review and accuracy (individual or team).
                  </FormHelperText>
                </FormControl>

                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600} component="h3">
                    Attachments
                  </Typography>
                  <Typography
                    variant="textSm"
                    sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
                  >
                    Supplementary reference material only — not a primary data field. Examples: threat intelligence
                    bulletins, vendor advisories, internal incident reports. Do not store critical structured
                    information in attachments.
                  </Typography>
                  {attachments.length === 0 ? (
                    <Typography
                      variant="textSm"
                      sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
                    >
                      No attachments.
                    </Typography>
                  ) : (
                    <Stack component="ul" sx={{ pl: 2.5, m: 0 }} spacing={0.5}>
                      {attachments.map((a) => (
                        <Typography key={a.id} component="li" variant="textSm">
                          {a.fileName}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                  <Button variant="outlined" size="small" disabled sx={{ alignSelf: "flex-start" }}>
                    Add attachment
                  </Button>
                  <Typography
                    variant="caption"
                    sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
                  >
                    Prototype: linking files is not enabled.
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box
            role="tabpanel"
            id="threat-panel-1"
            aria-labelledby="threat-tab-1"
            sx={{ py: 3 }}
          >
            <Typography variant="textMd" sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
              Linked assets, vulnerabilities, and other relationships can be surfaced here when you are ready to
              extend this tab.
            </Typography>
          </Box>
        )}

        {tab === 2 && (
          <Box
            role="tabpanel"
            id="threat-panel-2"
            aria-labelledby="threat-tab-2"
            sx={{ py: 3 }}
          >
            <Typography variant="textMd" sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
              Threat intelligence sources and context will appear here.
            </Typography>
          </Box>
        )}

        {tab === 3 && (
          <Box
            role="tabpanel"
            id="threat-panel-3"
            aria-labelledby="threat-tab-3"
            sx={{ py: 3 }}
          >
            <Typography variant="textMd" sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
              Assessments for this threat will appear here. Only threats with status Active appear in assessment
              dropdowns.
            </Typography>
          </Box>
        )}
      </Stack>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={handleToastClose}
          action={toastAction}
          aria-live="polite"
          variant="standard"
        >
          Threat category successfully added.
        </Alert>
      </Snackbar>
    </Container>
  );
}

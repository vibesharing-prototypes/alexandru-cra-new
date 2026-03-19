import { useCallback, useMemo, useState } from "react";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

type RagKey = "neg05" | "neg04" | "neg03" | "neu03" | "pos04";

type ScoreValue = {
  numeric: string;
  label: string;
  rag: RagKey;
} | null;

type ScoringRow = {
  id: string;
  kind: "cyberRisk" | "scenario";
  /** Cyber risk group id scenarios belong to */
  groupId: string;
  tag: string;
  title: React.ReactNode;
  impact: ScoreValue;
  threat: ScoreValue;
  vulnerability: ScoreValue;
  likelihood: ScoreValue;
  cyberRiskScore: ScoreValue;
};

/** Minimal token shape for RAG paths (avoids coupling to full LensThemeTokens). */
type RagPalette = {
  negative: Record<"03" | "04" | "05", { value: string }>;
  neutral: Record<"03", { value: string }>;
  positive: Record<"04", { value: string }>;
};

function ragSwatchColor(tokens: { semantic: { color: { dataVisualization: { rag: RagPalette } } } }, rag: RagKey) {
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

function RiskLegendCell({ value }: { value: ScoreValue }) {
  return (
    <Box sx={{ minHeight: 56, display: "flex", alignItems: "center", py: 1 }}>
      {value == null ? (
        <Typography
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.label.xs.fontSize.value,
            lineHeight: t.semantic.font.label.xs.lineHeight.value,
            letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
            fontFamily: t.semantic.font.label.xs.fontFamily.value,
            fontWeight: t.semantic.font.label.xs.fontWeight.value,
            color: t.semantic.color.type.muted.value,
          })}
        >
          -
        </Typography>
      ) : (
        <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
          <Box
            sx={({ tokens: t }) => ({
              width: 16,
              height: 16,
              borderRadius: t.semantic.radius.sm.value,
              flexShrink: 0,
              bgcolor: ragSwatchColor(t, value.rag),
            })}
          />
          <Typography
            component="span"
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.label.xs.fontSize.value,
              lineHeight: t.semantic.font.label.xs.lineHeight.value,
              letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
              fontFamily: t.semantic.font.label.xs.fontFamily.value,
              fontWeight: t.semantic.font.label.xs.fontWeight.value,
              color: t.semantic.color.type.default.value,
              whiteSpace: "nowrap",
            })}
          >
            {value.numeric} - {value.label}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

const SCORING_ROWS: ScoringRow[] = [
  {
    id: "cr-rw",
    kind: "cyberRisk",
    groupId: "rw",
    tag: "Cyber risk",
    title: (
      <Link
        href="#"
        onClick={(e) => e.preventDefault()}
        underline="always"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          fontWeight: 600,
          color: t.semantic.color.type.default.value,
        })}
      >
        Loss of revenue due to Ransomware attack
      </Link>
    ),
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    id: "rw-s1",
    kind: "scenario",
    groupId: "rw",
    tag: "Scenario 1",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Loss of revenue due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Ransomware attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Unpatched web server
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Payment gateway
        </Box>
        .
      </Typography>
    ),
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "15", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "60", label: "Medium", rag: "neu03" },
  },
  {
    id: "rw-s2",
    kind: "scenario",
    groupId: "rw",
    tag: "Scenario 2",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Loss of revenue due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Ransomware attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Missing Multi-Factor Authentication
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Customer database
        </Box>
      </Typography>
    ),
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "100", label: "Very high", rag: "neg05" },
  },
  {
    id: "rw-s3",
    kind: "scenario",
    groupId: "rw",
    tag: "Scenario 3",
    title: (
      <Typography
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Data breach due to phishing attack
      </Typography>
    ),
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: { numeric: "20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "16", label: "High", rag: "neg03" },
  },
  {
    id: "rw-s4",
    kind: "scenario",
    groupId: "rw",
    tag: "Scenario 4",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Loss of revenue due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Ransomware attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Missing Multi-Factor Authentication
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Social media accounts
        </Box>
      </Typography>
    ),
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "60", label: "Medium", rag: "neu03" },
  },
  {
    id: "cr-ph",
    kind: "cyberRisk",
    groupId: "ph",
    tag: "Cyber risk",
    title: (
      <Link
        href="#"
        onClick={(e) => e.preventDefault()}
        underline="always"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          fontWeight: 600,
          color: t.semantic.color.type.default.value,
        })}
      >
        Loss of revenue due to Phishing attack on Social media accounts.
      </Link>
    ),
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    id: "ph-s1",
    kind: "scenario",
    groupId: "ph",
    tag: "Scenario 1",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Data breach due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Phishing attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          SQL Injection
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Social media accounts
        </Box>
      </Typography>
    ),
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "3", label: "Medium", rag: "neu03" },
    likelihood: { numeric: "12", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "60", label: "Medium", rag: "neu03" },
  },
  {
    id: "ph-s2",
    kind: "scenario",
    groupId: "ph",
    tag: "Scenario 2",
    title: (
      <Typography
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Account takeover via phishing email
      </Typography>
    ),
    impact: { numeric: "3", label: "Medium", rag: "neu03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "2", label: "Low", rag: "pos04" },
    likelihood: { numeric: "25", label: "Very high", rag: "neg05" },
    cyberRiskScore: { numeric: "48", label: "Medium", rag: "neu03" },
  },
  {
    id: "ph-s3",
    kind: "scenario",
    groupId: "ph",
    tag: "Scenario 3",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Data breach due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Phishing attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          SQL Injection
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Social media accounts
        </Box>
      </Typography>
    ),
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "3", label: "Medium", rag: "neu03" },
    likelihood: { numeric: "20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "75", label: "High", rag: "neg03" },
  },
  {
    id: "ph-s4",
    kind: "scenario",
    groupId: "ph",
    tag: "Scenario 4",
    title: (
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Data breach due to{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Phishing attack
        </Box>{" "}
        exploiting{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          SQL Injection
        </Box>{" "}
        on{" "}
        <Box
          component="span"
          sx={({ tokens: t }) => ({
            fontWeight: 600,
            textDecoration: "underline",
            color: t.semantic.color.action.link.default.value,
          })}
        >
          Customer database
        </Box>
      </Typography>
    ),
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "100", label: "Very high", rag: "neg05" },
  },
];

function NameCell({
  row,
  expanded,
  onToggle,
}: {
  row: ScoringRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isGroup = row.kind === "cyberRisk";
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      gap={1}
      sx={{
        py: 1,
        minHeight: 56,
        pl: isGroup ? 0 : 4,
      }}
    >
      {isGroup ? (
        <IconButton
          size="small"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse cyber risk" : "Expand cyber risk"}
          sx={{ mt: 0.25, p: 0.5 }}
        >
          <ExpandDownIcon
            aria-hidden
            sx={{
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          />
        </IconButton>
      ) : null}
      <Stack gap={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={({ tokens: t }) => ({
            alignSelf: "flex-start",
            px: 0.5,
            py: 0.25,
            borderRadius: t.semantic.radius.sm.value,
            bgcolor: t.semantic.color.surface.variant.value,
          })}
        >
          <Typography
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.label.sm.fontSize.value,
              lineHeight: t.semantic.font.label.sm.lineHeight.value,
              letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
              fontWeight: 600,
              color: t.semantic.color.type.default.value,
            })}
          >
            {row.tag}
          </Typography>
        </Box>
        <Box sx={{ overflow: "hidden" }}>{row.title}</Box>
      </Stack>
    </Stack>
  );
}

export default function NewCyberRiskAssessmentScoringTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    rw: true,
    ph: true,
  });

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const visibleRows = useMemo(() => {
    const out: ScoringRow[] = [];
    let currentGroup = "";
    let groupOpen = true;
    for (const row of SCORING_ROWS) {
      if (row.kind === "cyberRisk") {
        currentGroup = row.groupId;
        groupOpen = expanded[row.groupId] !== false;
        out.push(row);
        continue;
      }
      if (row.groupId === currentGroup && groupOpen) {
        out.push(row);
      }
    }
    return out;
  }, [expanded]);

  return (
    <Stack gap={3} sx={{ pt: 3, pb: 4 }}>
      <SectionHeader title="Scoring" headingLevel="h2" />

      <Box
        sx={({ tokens: t }) => ({
          borderRadius: t.semantic.radius.md.value,
          bgcolor: t.semantic.color.accent.red.background.value,
          overflow: "hidden",
          width: "100%",
          maxWidth: 1280,
          p: 1,
        })}
      >
        <TableContainer
          sx={{
            overflowX: "auto",
            borderRadius: ({ tokens: t }) => t.semantic.radius.sm.value,
            bgcolor: ({ tokens: t }) => t.semantic.color.background.base.value,
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 1100,
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderBottom: ({ tokens: t }) => `1px solid ${t.semantic.color.ui.divider.default.value}`,
                verticalAlign: "top",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={({ tokens: t }) => ({
                  "& .MuiTableCell-head": {
                    bgcolor: t.semantic.color.background.container.value,
                    fontSize: t.semantic.font.label.sm.fontSize.value,
                    lineHeight: t.semantic.font.label.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
                    fontWeight: 600,
                    color: t.semantic.color.type.default.value,
                    py: 0.5,
                    px: 2,
                    maxHeight: 56,
                  },
                })}
              >
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    minWidth: 320,
                    maxWidth: 420,
                    boxShadow: ({ tokens: t }) => `4px 0 8px -4px ${t.semantic.color.ui.divider.default.value}`,
                  }}
                >
                  Name
                </TableCell>
                <TableCell>Impact</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Threat severity</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Vulnerability severity</TableCell>
                <TableCell>Likelihood</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Cyber risk score</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    width: 48,
                    position: "sticky",
                    right: 0,
                    zIndex: 3,
                    boxShadow: ({ tokens: t }) => `-4px 0 8px -4px ${t.semantic.color.ui.divider.default.value}`,
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    sx={({ tokens: t }) => ({
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      bgcolor: t.semantic.color.background.base.value,
                      minWidth: 320,
                      maxWidth: 420,
                      boxShadow: `4px 0 8px -4px ${t.semantic.color.ui.divider.default.value}`,
                    })}
                  >
                    <NameCell
                      row={row}
                      expanded={expanded[row.groupId] !== false}
                      onToggle={() => toggleGroup(row.groupId)}
                    />
                  </TableCell>
                  <TableCell sx={{ px: 2, py: 0 }}>
                    <RiskLegendCell value={row.impact} />
                  </TableCell>
                  <TableCell sx={{ px: 2, py: 0 }}>
                    <RiskLegendCell value={row.threat} />
                  </TableCell>
                  <TableCell sx={{ px: 2, py: 0 }}>
                    <RiskLegendCell value={row.vulnerability} />
                  </TableCell>
                  <TableCell sx={{ px: 2, py: 0 }}>
                    <RiskLegendCell value={row.likelihood} />
                  </TableCell>
                  <TableCell sx={{ px: 2, py: 0 }}>
                    <RiskLegendCell value={row.cyberRiskScore} />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={({ tokens: t }) => ({
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                      bgcolor: t.semantic.color.background.base.value,
                      boxShadow: `-4px 0 8px -4px ${t.semantic.color.ui.divider.default.value}`,
                      verticalAlign: "middle",
                    })}
                  >
                    <IconButton size="small" aria-label="Row actions">
                      <MoreIcon aria-hidden />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}

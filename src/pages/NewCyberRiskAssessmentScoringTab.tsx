import { useCallback, useId, useMemo, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";

import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import CraScenarioEmphasisTitle from "../components/CraScenarioEmphasisTitle.js";
import { CRA_SCORING_ROW_DEFINITIONS, type CraScoreValue } from "../data/craScoringScenarioLibrary.js";

type ScoreValue = CraScoreValue;

type RagKey = NonNullable<NonNullable<ScoreValue>["rag"]>;

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

type AggregationMethod = "highest" | "average" | "weightedAverage";

const SCENARIO_DETAIL_PATH = "/cyber-risk/cyber-risk-assessments/new/scenario";

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

const SCORING_ROWS: ScoringRow[] = CRA_SCORING_ROW_DEFINITIONS.map((def) => {
  if (def.kind === "cyberRisk") {
    return {
      id: def.id,
      kind: "cyberRisk" as const,
      groupId: def.groupId,
      tag: def.tag,
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
          {def.titleLinkText}
        </Link>
      ),
      impact: def.impact,
      threat: def.threat,
      vulnerability: def.vulnerability,
      likelihood: def.likelihood,
      cyberRiskScore: def.cyberRiskScore,
    };
  }
  return {
    id: def.id,
    kind: "scenario" as const,
    groupId: def.groupId,
    tag: def.tag,
    title: <CraScenarioEmphasisTitle segments={def.titleSegments} />,
    impact: def.impact,
    threat: def.threat,
    vulnerability: def.vulnerability,
    likelihood: def.likelihood,
    cyberRiskScore: def.cyberRiskScore,
  };
});

function parseScoreNumeric(value: ScoreValue): number | null {
  if (value == null) return null;
  const n = Number.parseFloat(value.numeric);
  return Number.isFinite(n) ? n : null;
}

function scoreFromAggregatedNumeric(aggregated: number, referenceScenarios: ScoringRow[]): ScoreValue {
  const rounded = Math.round(aggregated);
  const withScores = referenceScenarios.filter((s) => s.cyberRiskScore != null);
  if (withScores.length === 0) return null;
  let best = withScores[0].cyberRiskScore!;
  let bestDist = Math.abs(parseScoreNumeric(best)! - aggregated);
  for (const s of withScores) {
    if (s.cyberRiskScore == null) continue;
    const n = parseScoreNumeric(s.cyberRiskScore);
    if (n == null) continue;
    const d = Math.abs(n - aggregated);
    if (d < bestDist) {
      best = s.cyberRiskScore;
      bestDist = d;
    }
  }
  return {
    numeric: String(rounded),
    label: best.label,
    rag: best.rag,
  };
}

function aggregateCyberRiskScoreForGroup(
  scenariosInGroup: ScoringRow[],
  method: AggregationMethod,
): ScoreValue {
  const withCyber = scenariosInGroup.filter((s) => s.cyberRiskScore != null);
  if (withCyber.length === 0) return null;

  if (method === "highest") {
    let bestRow = withCyber[0];
    let bestN = parseScoreNumeric(bestRow.cyberRiskScore)!;
    for (const s of withCyber) {
      const n = parseScoreNumeric(s.cyberRiskScore)!;
      if (n > bestN) {
        bestN = n;
        bestRow = s;
      }
    }
    return bestRow.cyberRiskScore;
  }

  const entries = withCyber.map((s) => ({
    n: parseScoreNumeric(s.cyberRiskScore)!,
    weight: parseScoreNumeric(s.likelihood) ?? 1,
  }));

  if (method === "average") {
    const sum = entries.reduce((acc, e) => acc + e.n, 0);
    return scoreFromAggregatedNumeric(sum / entries.length, withCyber);
  }

  let weightTotal = 0;
  let weightedSum = 0;
  for (const e of entries) {
    const w = e.weight > 0 ? e.weight : 1;
    weightedSum += e.n * w;
    weightTotal += w;
  }
  if (weightTotal === 0) return null;
  return scoreFromAggregatedNumeric(weightedSum / weightTotal, withCyber);
}

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
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse cyber risk" : "Expand cyber risk"}
          sx={{ mt: 0.25, p: 0.5 }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{
              display: "inline-flex",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandDownIcon />
          </Box>
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
        <Box
          sx={{
            minWidth: 0,
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            "& .MuiTypography-root": { whiteSpace: "normal" },
            "& .MuiLink-root": { whiteSpace: "normal" },
          }}
        >
          {row.title}
        </Box>
      </Stack>
    </Stack>
  );
}

type NewCyberRiskAssessmentScoringTabProps = {
  /** Passed to the scenario detail page for breadcrumbs. */
  assessmentName?: string;
};

export default function NewCyberRiskAssessmentScoringTab({
  assessmentName = "",
}: NewCyberRiskAssessmentScoringTabProps) {
  const navigate = useNavigate();
  const aggregationLabelId = useId();
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    rw: true,
    ph: true,
  });

  const goToScenario = useCallback(
    (scenarioId: string) => {
      navigate(`${SCENARIO_DETAIL_PATH}/${encodeURIComponent(scenarioId)}`, {
        state: { assessmentName: assessmentName.trim() || undefined },
      });
    },
    [navigate, assessmentName],
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const scenariosByGroupId = useMemo(() => {
    const m = new Map<string, ScoringRow[]>();
    for (const row of SCORING_ROWS) {
      if (row.kind !== "scenario") continue;
      const list = m.get(row.groupId) ?? [];
      list.push(row);
      m.set(row.groupId, list);
    }
    return m;
  }, []);

  const aggregatedCyberRiskByGroupId = useMemo(() => {
    const result = new Map<string, ScoreValue>();
    if (aggregationMethod == null) return result;
    for (const [groupId, scenarios] of scenariosByGroupId) {
      result.set(groupId, aggregateCyberRiskScoreForGroup(scenarios, aggregationMethod));
    }
    return result;
  }, [aggregationMethod, scenariosByGroupId]);

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

  const handleAggregationChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === "highest" || value === "average" || value === "weightedAverage") {
      setAggregationMethod(value);
    }
  }, []);

  return (
    <Stack gap={3} sx={{ pt: 3, pb: 4 }}>
      <Stack gap={1.5} sx={{ maxWidth: 1280, width: "100%" }}>
        <Typography
          id={aggregationLabelId}
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
          Aggregation method
        </Typography>
        <FormControl variant="standard" fullWidth>
          <RadioGroup
            row
            aria-labelledby={aggregationLabelId}
            name="new-cra-scoring-aggregation"
            value={aggregationMethod ?? ""}
            onChange={handleAggregationChange}
          >
            <FormControlLabel
              value="highest"
              control={<Radio />}
              label="Highest"
              slotProps={{
                typography: {
                  sx: ({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    color: t.semantic.color.type.default.value,
                  }),
                },
              }}
            />
            <FormControlLabel
              value="average"
              control={<Radio />}
              label="Average"
              slotProps={{
                typography: {
                  sx: ({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    color: t.semantic.color.type.default.value,
                  }),
                },
              }}
            />
            <FormControlLabel
              value="weightedAverage"
              control={<Radio />}
              label="Weighted average"
              slotProps={{
                typography: {
                  sx: ({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    color: t.semantic.color.type.default.value,
                  }),
                },
              }}
            />
          </RadioGroup>
        </FormControl>
      </Stack>

      <Box
        sx={({ tokens: t }) => ({
          borderRadius: t.semantic.radius.md.value,
          background: "none",
          backgroundColor: "unset",
          overflow: "hidden",
          width: "100%",
          maxWidth: 1280,
          p: 0,
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
              tableLayout: "fixed",
              width: "100%",
              minWidth: 1100,
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderBottom: ({ tokens: t }) => `1px solid ${t.semantic.color.ui.divider.default.value}`,
              },
              "& .MuiTableBody-root .MuiTableCell-root": {
                verticalAlign: "middle",
              },
            }}
          >
            <colgroup>
              <col style={{ width: 420 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col style={{ width: 48 }} />
            </colgroup>
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
                    verticalAlign: "middle",
                  },
                })}
              >
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    width: 420,
                    minWidth: 320,
                    maxWidth: 420,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
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
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => {
                const isScenario = row.kind === "scenario";
                return (
                  <TableRow
                    key={row.id}
                    hover={isScenario}
                    tabIndex={isScenario ? 0 : undefined}
                    aria-label={
                      isScenario
                        ? `Open ${row.tag}: ${row.id}. Press Enter to view scoring rationale.`
                        : undefined
                    }
                    onClick={() => {
                      if (isScenario) goToScenario(row.id);
                    }}
                    onKeyDown={(e) => {
                      if (!isScenario) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToScenario(row.id);
                      }
                    }}
                    sx={
                      isScenario
                        ? ({ tokens: t }) => ({
                            cursor: "pointer",
                            "&:focus-visible": {
                              outline: `2px solid ${t.semantic.color.action.primary.default.value}`,
                              outlineOffset: -2,
                            },
                          })
                        : undefined
                    }
                  >
                    <TableCell
                      sx={({ tokens: t }) => ({
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        bgcolor: t.semantic.color.background.base.value,
                        width: 420,
                        minWidth: 320,
                        maxWidth: 420,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
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
                      <RiskLegendCell
                        value={
                          row.kind === "cyberRisk"
                            ? aggregationMethod
                              ? aggregatedCyberRiskByGroupId.get(row.groupId) ?? null
                              : null
                            : row.cyberRiskScore
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={({ tokens: t }) => ({
                        position: "sticky",
                        right: 0,
                        zIndex: 2,
                        bgcolor: t.semantic.color.background.base.value,
                        verticalAlign: "middle",
                      })}
                    >
                      <IconButton
                        size="small"
                        aria-label="Row actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreIcon aria-hidden />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}

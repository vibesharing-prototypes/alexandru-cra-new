import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputAdornment,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
  ColumnsPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  Toolbar,
} from "@mui/x-data-grid-pro";
import { NavLink } from "react-router";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";

import {
  type RiskHeatmapLevel,
  ragDataVizColor,
  RISK_HEATMAP_LEVEL_TO_RAG,
} from "../data/ragDataVisualization.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getUserById } from "../data/users.js";
import type { CyberRiskStatus, FivePointScaleLabel } from "../data/types.js";
import ResidualRisksMatrix from "../components/ResidualRisksMatrix.js";
import RiskStatusDonut from "../components/RiskStatusDonut.js";
import { buildCyberRiskHeatmapAggregates } from "../utils/cyberRiskMatrixAggregates.js";

// ---------------------------------------------------------------------------
// Workflow status donut data
// ---------------------------------------------------------------------------

const workflowData = [
  { label: "Identification", value: 26, color: "#c6c6c9" },
  { label: "Assessment", value: 46, color: "#1565c0" },
  { label: "Mitigation", value: 106, color: "#0086fa" },
  { label: "Monitoring", value: 38, color: "#64b5f6" },
];

const { grid: heatmapGrid, legend: heatmapLegend } = buildCyberRiskHeatmapAggregates(cyberRisks);

// ---------------------------------------------------------------------------
// Cyber risks table data
// ---------------------------------------------------------------------------

type WorkflowStatus = CyberRiskStatus;

interface CyberRiskRow {
  id: string;
  name: string;
  riskId: string;
  cyberRiskScore: string;
  riskLevel: RiskHeatmapLevel | null;
  ownerName: string;
  ownerInitials: string;
  assets: number;
  workflowStatus: WorkflowStatus;
}

const AVATAR_COLORS = ["red", "blue", "green", "purple", "yellow"] as const;

const SCORE_LABEL_TO_HEATMAP: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
  "Very low": "veryLow",
  Low: "low",
  Medium: "medium",
  High: "high",
  "Very high": "veryHigh",
};

const cyberRiskRows: CyberRiskRow[] = cyberRisks.map((r) => {
  const owner = getUserById(r.ownerId);
  return {
    id: r.id,
    name: r.name,
    riskId: r.id,
    cyberRiskScore: `${r.cyberRiskScore} - ${r.cyberRiskScoreLabel}`,
    riskLevel: SCORE_LABEL_TO_HEATMAP[r.cyberRiskScoreLabel],
    ownerName: owner?.fullName ?? "Unassigned",
    ownerInitials: owner?.initials ?? "",
    assets: r.assetIds.length,
    workflowStatus: r.status,
  };
});

// ---------------------------------------------------------------------------
// Workflow status badge color mapping
// ---------------------------------------------------------------------------

const WORKFLOW_STATUS_COLOR: Record<
  WorkflowStatus,
  "warning" | "information" | "generic" | "success"
> = {
  Assessment: "warning",
  Mitigation: "information",
  Identification: "generic",
  Monitoring: "success",
  Draft: "generic",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CyberRiskScoreCell({
  score,
  level,
}: {
  score: string;
  level: RiskHeatmapLevel | null;
}) {
  if (!level) {
    return <Typography variant="textMd">{score}</Typography>;
  }

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box
        sx={({ tokens: t }) => ({
          width: 16,
          height: 16,
          borderRadius: 0.5,
          backgroundColor: ragDataVizColor(t, RISK_HEATMAP_LEVEL_TO_RAG[level]),
          flexShrink: 0,
        })}
      />
      <Typography variant="textMd">{score}</Typography>
    </Stack>
  );
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;
  const isUnassigned = name === "Unassigned";
  const colorIndex = initials
    ? initials.charCodeAt(0) % AVATAR_COLORS.length
    : 0;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar
        {...getAvatarProps({
          size: "small",
          color: AVATAR_COLORS[colorIndex],
        })}
        aria-label={name}
        role="img"
      >
        {isUnassigned ? <AvatarIcon aria-hidden /> : initials}
      </Avatar>
      <Typography variant="textMd">{name}</Typography>
    </Stack>
  );
}

function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  return <StatusIndicator color={WORKFLOW_STATUS_COLOR[status]} label={status} />;
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function CustomToolbar() {
  return (
    <Toolbar>
      <QuickFilter expanded>
        <QuickFilterControl
          render={({ ref, value, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              value={value ?? ""}
              label="Search by"
              placeholder="Search by"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  ...other.slotProps?.input,
                },
                ...other.slotProps,
              }}
            />
          )}
        />
      </QuickFilter>
      <ColumnsPanelTrigger
        render={(props) => (
          <Button
            {...props}
            startIcon={<ColumnsIcon />}
            aria-label="Select columns"
          >
            Columns
          </Button>
        )}
      />
    </Toolbar>
  );
}

// ---------------------------------------------------------------------------
// Data grid
// ---------------------------------------------------------------------------

function CyberRisksDataGrid() {
  const columns: GridColDef<CyberRiskRow>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<CyberRiskRow>) => (
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "riskId",
      headerName: "ID",
      width: 120,
    },
    {
      field: "cyberRiskScore",
      headerName: "Cyber risk score",
      width: 170,
      renderCell: (params: GridRenderCellParams<CyberRiskRow>) => (
        <CyberRiskScoreCell
          score={params.row.cyberRiskScore}
          level={params.row.riskLevel}
        />
      ),
    },
    {
      field: "ownerName",
      headerName: "Owner",
      width: 200,
      renderCell: (params: GridRenderCellParams<CyberRiskRow>) => (
        <OwnerCell
          name={params.row.ownerName}
          initials={params.row.ownerInitials}
        />
      ),
    },
    {
      field: "assets",
      headerName: "Assets",
      width: 100,
      type: "number",
    },
    {
      field: "workflowStatus",
      headerName: "Workflow status",
      width: 160,
      renderCell: (params: GridRenderCellParams<CyberRiskRow>) => (
        <WorkflowStatusBadge status={params.row.workflowStatus} />
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={cyberRiskRows}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          main: {
            "aria-label":
              "Cyber risks table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
          },
          basePagination: {
            material: {
              labelRowsPerPage: "Rows",
            },
          },
        }}
        sx={{ border: 0 }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RisksPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={6}>
        <PageHeader
          pageTitle="Cyber risks"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset Manager</span>}
              items={[
                {
                  id: "cyber-risk",
                  label: "Cyber risk management",
                  url: "/cyber-risk/overview",
                },
                {
                  id: "cyber-risks",
                  label: "Cyber risks",
                  url: "/cyber-risk/cyber-risks",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
        />

        <Card
          sx={({ tokens }) => ({
            backgroundColor: tokens.semantic.color.background.container.value,
            border: "none",
          })}
        >
          <CardHeader
            sx={{ display: "flex" }}
            title={
              <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
                Overview
              </Typography>
            }
            action={
              <Select value="all" size="medium" sx={{ minWidth: 180 }}>
                <MenuItem value="all">All business units</MenuItem>
              </Select>
            }
          />
          <CardContent>
            <Stack direction="row" gap={3} sx={{ alignItems: "stretch" }}>
              <RiskStatusDonut data={workflowData} />
              <ResidualRisksMatrix
                title="Residual risks"
                grid={heatmapGrid}
                legend={heatmapLegend}
                sx={{ flex: 3, minWidth: 0 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <CyberRisksDataGrid />
      </Stack>
    </Container>
  );
}

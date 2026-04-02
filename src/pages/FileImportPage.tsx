import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  GridActionsCellItem,
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  FilterPanelTrigger,
} from "@mui/x-data-grid-pro";
import { NavLink, useNavigate } from "react-router";

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import PageLayout from "../components/PageLayout.js";

type ImportStatus = "success" | "error" | "generic";
type ImportType = "Automated" | "Manual";

interface FileImportRow {
  id: number;
  jobId: number;
  files: number;
  type: ImportType;
  lastImport: string;
  status: ImportStatus;
  statusLabel: string;
}

const rows: FileImportRow[] = [
  {
    id: 1,
    jobId: 2515,
    files: 3,
    type: "Automated",
    lastImport: "14 May 2025 - 1:45:00",
    status: "success",
    statusLabel: "Success",
  },
  {
    id: 2,
    jobId: 2152,
    files: 5,
    type: "Manual",
    lastImport: "12 Apr 2025 - 1:32:00",
    status: "error",
    statusLabel: "Failed",
  },
  {
    id: 3,
    jobId: 1221,
    files: 4,
    type: "Automated",
    lastImport: "14 May 2025 - 1:45:00",
    status: "error",
    statusLabel: "Failed",
  },
  {
    id: 4,
    jobId: 2515,
    files: 5,
    type: "Manual",
    lastImport: "12 Apr 2025 - 1:32:00",
    status: "generic",
    statusLabel: "Draft",
  },
  {
    id: 5,
    jobId: 2152,
    files: 2,
    type: "Automated",
    lastImport: "14 May 2025 - 1:45:00",
    status: "success",
    statusLabel: "Success",
  },
];

function StatusCell({
  row,
}: {
  row: FileImportRow;
}) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  if (!StatusIndicator) return null;

  return (
    <StatusIndicator
      color={row.status}
      label={row.statusLabel}
      aria-label={`Status: ${row.statusLabel}`}
    />
  );
}

const columns: GridColDef<FileImportRow>[] = [
  {
    field: "jobId",
    headerName: "Job ID",
    width: 100,
    flex: 0,
  },
  {
    field: "files",
    headerName: "Files",
    width: 100,
    flex: 1,
  },
  {
    field: "type",
    headerName: "Type",
    width: 200,
    flex: 1,
  },
  {
    field: "lastImport",
    headerName: "Last import",
    width: 200,
    flex: 1,
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    flex: 0,
    renderCell: (params) => <StatusCell row={params.row} />,
  },
  {
    field: "actions",
    headerName: "",
    type: "actions",
    width: 62,
    resizable: false,
    getActions: () => [
      <GridActionsCellItem
        icon={<MoreIcon />}
        label="More actions"
        key="more"
      />,
    ],
  },
];

function FileImportToolbar() {
  return (
    <Toolbar>
      <QuickFilter expanded>
        <QuickFilterControl
          render={({ ref, value, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              value={value}
              placeholder="Search by"
              size="small"
              sx={{ width: 300 }}
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
      <FilterPanelTrigger
        render={(props) => (
          <Button
            {...props}
            variant="text"
            startIcon={<FilterIcon />}
            aria-label="Show filters"
          >
            Filter
          </Button>
        )}
      />
    </Toolbar>
  );
}

export default function FileImportPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  return (
    <PageLayout>
      <PageHeader
        pageTitle="File import"
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>Asset Manager</span>}
            items={[
              {
                id: "cyber-risk",
                label: "Cyber risk management",
                url: "/cyber-risk",
              },
              {
                id: "file-import",
                label: "File import",
                url: "/cyber-risk/file-import",
              },
            ]}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
          </OverflowBreadcrumbs>
        }
        moreButton={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="text">Automated import</Button>
            <Button variant="contained" onClick={() => navigate("upload")}>
              Upload files
            </Button>
          </Box>
        }
      />

      <Box sx={{ width: "100%" }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          showToolbar
          slots={{
            toolbar: FileImportToolbar,
          }}
          slotProps={{
            main: {
              "aria-label":
                "File import data. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
            },
            basePagination: {
              material: {
                labelRowsPerPage: "Rows",
              },
            },
          }}
        />
      </Box>
    </PageLayout>
  );
}

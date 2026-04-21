import { useMemo } from "react";
import { Avatar, Box, Typography, useTheme, type Theme } from "@mui/material";
import {
  gridFilteredDescendantCountLookupSelector,
  useGridSelector,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  DataGridPro,
  useGridApiContext,
  useGridRootProps,
} from "@mui/x-data-grid-pro";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";

export type TableTreeRow = {
  id: string;
  hierarchy: string[];
  recordType: string;
};

const TABLE_TREE_ROWS: TableTreeRow[] = [
  { id: "r-na", hierarchy: ["North America"], recordType: "Region" },
  {
    id: "r-na-little",
    hierarchy: ["North America", "LittleThings Ltd."],
    recordType: "Subsidiary",
  },
  {
    id: "r-na-little-hr",
    hierarchy: ["North America", "LittleThings Ltd.", "Human Resources"],
    recordType: "Department",
  },
  {
    id: "r-na-little-fin",
    hierarchy: ["North America", "LittleThings Ltd.", "Finance"],
    recordType: "Department",
  },
  {
    id: "r-na-little-leg",
    hierarchy: ["North America", "LittleThings Ltd.", "Legal"],
    recordType: "Department",
  },
  {
    id: "r-na-logi",
    hierarchy: ["North America", "LogiStocks Ltd."],
    recordType: "Subsidiary",
  },
  {
    id: "r-na-logi-inv",
    hierarchy: ["North America", "LogiStocks Ltd.", "Regional Inventory Management"],
    recordType: "Process",
  },
  {
    id: "r-na-logi-tax",
    hierarchy: ["North America", "LogiStocks Ltd.", "Regional  Tax Compliance"],
    recordType: "Process",
  },
  { id: "r-emea", hierarchy: ["EMEA"], recordType: "Region" },
  {
    id: "r-emea-ap",
    hierarchy: ["EMEA", "Global accounts payable"],
    recordType: "Process",
  },
  {
    id: "r-emea-cyber",
    hierarchy: ["EMEA", "Global cyber security"],
    recordType: "Process",
  },
];

function levelBadgeLabel(row: TableTreeRow): string {
  const d = row.hierarchy.length;
  return `L${Math.min(d, 3)}`;
}

function treeCellLabel(row: TableTreeRow): string {
  return row.hierarchy[row.hierarchy.length - 1] ?? "";
}

/** Horizontal width per tree depth step (matches Figma guide rhythm). */
const TREE_GUIDE_STEP_PX = 14;

function TreeGuideRails({ depth }: { depth: number }) {
  const theme = useTheme();
  const dividerColor = theme.tokens.semantic.color.ui.divider.default.value;

  if (depth <= 0) {
    return null;
  }

  return (
    <Box
      aria-hidden
      sx={{
        display: "flex",
        alignSelf: "stretch",
        flexShrink: 0,
        alignItems: "stretch",
        height: "100%",
        minHeight: 52,
      }}
    >
      {Array.from({ length: depth }, (_, level) => {
        const isLastGuide = level === depth - 1;
        return (
          <Box
            key={level}
            sx={{
              position: "relative",
              width: TREE_GUIDE_STEP_PX,
              flexShrink: 0,
              ...(isLastGuide
                ? {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: 0,
                      bottom: "50%",
                      width: "1px",
                      bgcolor: dividerColor,
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      height: "1px",
                      width: `${TREE_GUIDE_STEP_PX / 2 + 4}px`,
                      bgcolor: dividerColor,
                      borderRadius: "0 0 0 1px",
                    },
                  }
                : {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      bgcolor: dividerColor,
                    },
                  }),
            }}
          />
        );
      })}
    </Box>
  );
}

function OrgTreeGroupingCell(props: GridRenderCellParams<TableTreeRow>) {
  const { id, field, row, rowNode } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const filteredDescendantCountLookup = useGridSelector(
    apiRef,
    gridFilteredDescendantCountLookupSelector,
  );
  const filteredDescendantCount = filteredDescendantCountLookup[rowNode.id] ?? 0;
  const isGroupNode = rowNode.type === "group";
  const childrenExpanded = isGroupNode && Boolean(rowNode.childrenExpanded);
  const Icon = childrenExpanded
    ? rootProps.slots.treeDataCollapseIcon!
    : rootProps.slots.treeDataExpandIcon!;
  const BaseIconButton = rootProps.slots.baseIconButton!;
  const label = treeCellLabel(row);

  const handleToggle = (event: React.MouseEvent) => {
    if (!isGroupNode) return;
    apiRef.current.setRowChildrenExpansion(id, !childrenExpanded);
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };

  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        height: "100%",
        gap: t.core.spacing["1"].value,
      })}
    >
      <TreeGuideRails depth={rowNode.depth} />
      <Box
        sx={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {filteredDescendantCount > 0 ? (
          <BaseIconButton
            size="small"
            onClick={handleToggle}
            tabIndex={-1}
            aria-label={
              childrenExpanded
                ? apiRef.current.getLocaleText("treeDataCollapse")
                : apiRef.current.getLocaleText("treeDataExpand")
            }
            {...rootProps.slotProps?.baseIconButton}
          >
            <Icon fontSize="inherit" />
          </BaseIconButton>
        ) : null}
      </Box>
      <Avatar
        sx={({ tokens: t }) => ({
          width: 20,
          height: 20,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.4px",
          bgcolor: t.semantic.color.accent.purple.background.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        {levelBadgeLabel(row)}
      </Avatar>
      <Typography
        variant="body1"
        noWrap
        sx={({ tokens: t }) => ({
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          lineHeight: "20px",
          letterSpacing: "0.2px",
          color: t.semantic.color.type.default.value,
        })}
      >
        {label}
      </Typography>
    </Box>
  );
}

function dataGridTreeSx(theme: Theme) {
  const t = theme.tokens;
  const divider = t.semantic.color.ui.divider.default.value;
  const surface = t.semantic.color.surface.default.value;

  return {
    border: 0,
    borderRadius: t.semantic.radius.md.value,
    "& .MuiDataGrid-scrollShadow": {
      display: "none",
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: divider,
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: surface,
    },
    "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
      boxShadow: "none",
      borderColor: divider,
    },
    "& .MuiDataGrid-columnHeader": {
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      backgroundColor: surface,
      py: 0,
      alignItems: "center",
      display: "inline-flex",
    },
    "& .MuiDataGrid-row": {
      minHeight: 52,
      maxHeight: 52,
    },
  };
}

export function TableTree() {
  const columns: GridColDef<TableTreeRow>[] = useMemo(
    () => [
      {
        field: "recordType",
        headerName: "Type",
        width: 160,
        sortable: false,
        valueGetter: (_v, row) => row.recordType,
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: "100%", minHeight: 400 }}>
      <DataGridPro<TableTreeRow>
        rows={TABLE_TREE_ROWS}
        columns={columns}
        treeData
        getTreeDataPath={(row) => row.hierarchy}
        defaultGroupingExpansionDepth={-1}
        groupingColDef={{
          headerName: "Org units and processes",
          flex: 1,
          minWidth: 280,
          sortable: false,
          hideDescendantCount: true,
          renderCell: (params) => <OrgTreeGroupingCell {...params} />,
        }}
        disableRowSelectionOnClick
        hideFooter
        rowHeight={52}
        slots={{
          treeDataExpandIcon: (iconProps) => (
            <Box
              component="span"
              sx={{ display: "inline-flex", transform: "rotate(-90deg)" }}
              aria-hidden
            >
              <ExpandDownIcon {...iconProps} />
            </Box>
          ),
          treeDataCollapseIcon: (iconProps) => (
            <Box component="span" sx={{ display: "inline-flex" }} aria-hidden>
              <ExpandDownIcon {...iconProps} />
            </Box>
          ),
        }}
        slotProps={{
          main: {
            "aria-label":
              "Org units and processes. Tree table of regions, subsidiaries, and departments.",
          },
        }}
        sx={(theme) => dataGridTreeSx(theme)}
        showColumnVerticalBorder
        showCellVerticalBorder
      />
    </Box>
  );
}

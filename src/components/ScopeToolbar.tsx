import {
  Box,
  Button,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  ColumnsPanelTrigger,
} from "@mui/x-data-grid-pro";
import type { MouseEvent } from "react";

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";

import {
  DEFAULT_SEARCH_FIELD_SX,
  DEFAULT_SEARCH_PLACEHOLDER,
} from "./NewToolbar.js";

export type ScopeViewFilter = "all" | "included" | "excluded";

type ScopeToolbarBaseProps = {
  view: ScopeViewFilter;
  onViewChange: (e: MouseEvent<HTMLElement>, v: ScopeViewFilter | null) => void;
  totalCount: number;
  includedCount: number;
  onOpenFilters: () => void;
  /**
   * Number of filter **criteria** (categories with any selection), e.g. Criticality + Asset type = 2.
   * When &gt; 0, the Filter label shows `Filter (n)` and the icon uses the **filled** variant.
   */
  filterCriteriaCount?: number;
  /**
   * Clears applied filter state (same as **Clear filters** in [`FilterSideSheet`](./FilterSideSheet.tsx)).
   * When set and `filterCriteriaCount` &gt; 0, a **Clear filters** control is shown after **Columns**.
   */
  onClearFilters?: () => void;
  toolbarAriaLabel?: string;
  inclusionFilterAriaLabel?: string;
  /**
   * MUI `TextField` `label`. Omitted or `null`: no floating label (placeholder only).
   */
  searchLabel?: string | null;
  /**
   * @default "Search by"
   */
  searchPlaceholder?: string;
  /**
   * `sx` for the quick-filter search `TextField`. Defaults match [`NewToolbar`](./NewToolbar.tsx).
   */
  searchFieldSx?: SxProps<Theme>;
};

/**
 * DataGrid Pro **toolbar** for assessment scope: quick search, **Filter** (opens page filter UI via
 * `onOpenFilters`), **Columns**, optional **Clear filters** when criteria are applied (`onClearFilters`),
 * and inclusion filters (All / Included / Not included). Does not use MUI’s `FilterPanelTrigger`.
 */
export default function ScopeToolbar({
  view,
  onViewChange,
  totalCount,
  includedCount,
  onOpenFilters,
  filterCriteriaCount = 0,
  onClearFilters,
  toolbarAriaLabel = "Scope assets toolbar",
  inclusionFilterAriaLabel = "Filter assets by inclusion",
  searchLabel,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  searchFieldSx = DEFAULT_SEARCH_FIELD_SX,
}: ScopeToolbarBaseProps) {
  const textFieldLabel: string | undefined =
    searchLabel != null && searchLabel !== "" ? searchLabel : undefined;

  const hasFilterCriteria = filterCriteriaCount > 0;
  const filterButtonLabel = hasFilterCriteria
    ? `Filter (${filterCriteriaCount})`
    : "Filter";
  const filterButtonAriaLabel = hasFilterCriteria
    ? `Show filters, ${filterCriteriaCount} filter criteria applied`
    : "Show filters";

  const showClearFilters = hasFilterCriteria && Boolean(onClearFilters);

  return (
    <Toolbar
      aria-label={toolbarAriaLabel}
      style={{
        minHeight: 40,
        height: 40,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
      }}
    >
      <QuickFilter expanded>
        <QuickFilterControl
          render={({ ref, value, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              value={value ?? ""}
              label={textFieldLabel}
              placeholder={searchPlaceholder}
              size="small"
              sx={searchFieldSx}
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
      <Button
        type="button"
        startIcon={
          <FilterIcon variant={hasFilterCriteria ? "filled" : "outlined"} size="lg" aria-hidden />
        }
        aria-label={filterButtonAriaLabel}
        onClick={onOpenFilters}
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          px: 0.5,
          columnGap: 0.5,
        }}
      >
        {filterButtonLabel}
      </Button>
      <ColumnsPanelTrigger
        render={(props) => (
          <Button {...props} startIcon={<ColumnsIcon />} aria-label="Select columns">
            Columns
          </Button>
        )}
      />
      {showClearFilters ? (
        <Button
          type="button"
          variant="text"
          onClick={onClearFilters}
          aria-label="Clear filters"
          sx={{ ml: 0.5, whiteSpace: "nowrap" }}
        >
          Clear filters
        </Button>
      ) : null}
      <Box sx={{ flex: "1 1 120px" }} />
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label={inclusionFilterAriaLabel}
        size="small"
        sx={({ tokens: t }) => ({
          "& .MuiToggleButton-root": {
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderColor: t.semantic.color.outline.default.value,
          },
          "& .Mui-selected": {
            backgroundColor: `${t.semantic.color.action.primary.default.value} !important`,
            color: `${t.semantic.color.action.primary.onPrimary.value} !important`,
          },
        })}
      >
        <ToggleButton value="all">All ({totalCount})</ToggleButton>
        <ToggleButton value="included">
          {includedCount > 0 ? `Included (${includedCount})` : "Included"}
        </ToggleButton>
        <ToggleButton value="excluded">Not included</ToggleButton>
      </ToggleButtonGroup>
    </Toolbar>
  );
}

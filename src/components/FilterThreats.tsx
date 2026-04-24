import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";

import { assets } from "../data/assets.js";
import { vulnerabilities } from "../data/vulnerabilities.js";
import {
  type ThreatGridFilterRow,
  type ThreatTableFilters,
  uniqueSorted,
} from "../utils/threatTableFilters.js";

export type FilterThreatsProps = {
  value: ThreatTableFilters;
  onChange: (next: ThreatTableFilters) => void;
  /** Current grid rows; distinct people/source options are derived from these rows. */
  rows: ThreatGridFilterRow[];
  /**
   * When set, Assets autocomplete lists only these asset ids (plus any currently selected in `value`).
   * Omit for full catalog (e.g. [`ThreatsPage`](../pages/ThreatsPage.tsx)).
   */
  boundedAssetIds?: string[];
  /**
   * When set, Vulnerabilities autocomplete lists only these ids (plus any currently selected in `value`).
   */
  boundedVulnerabilityIds?: string[];
};

type IdLabelOption = { id: string; label: string };

const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

type MultiSelectFieldProps = {
  label: string;
  idSuffix: string;
  value: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  emptyPlaceholder: string;
};

function MultiSelectField({
  label,
  idSuffix,
  value,
  onChange,
  options,
  emptyPlaceholder,
}: MultiSelectFieldProps) {
  const { tokens } = useTheme();
  const labelId = `filter-threats-${idSuffix}-label`;

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx} id={labelId}>
        {label}
      </InputLabel>
      <Select
        multiple
        displayEmpty
        labelId={labelId}
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
                {emptyPlaceholder}
              </Box>
            );
          }
          if (vals.length === 1) return vals[0];
          return (
            <>
              <Box component="span" sx={{ mr: 0.5 }}>
                ({vals.length})
              </Box>
              {vals.join(", ")}
            </>
          );
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            <Checkbox checked={value.includes(opt)} size="small" disableRipple />
            <ListItemText primary={opt} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function FilterThreats({
  value,
  onChange,
  rows,
  boundedAssetIds,
  boundedVulnerabilityIds,
}: FilterThreatsProps) {
  const domainOptions = useMemo(
    () => uniqueSorted(rows.map((r) => r.threatDomain)),
    [rows],
  );
  const createdByOptions = useMemo(
    () => uniqueSorted(rows.map((r) => r.createdBy)),
    [rows],
  );
  const lastUpdatedByOptions = useMemo(
    () => uniqueSorted(rows.map((r) => r.lastUpdatedBy)),
    [rows],
  );

  const assetOptions = useMemo((): IdLabelOption[] => {
    const toOption = (a: (typeof assets)[number]): IdLabelOption => ({
      id: a.id,
      label: a.name,
    });
    if (boundedAssetIds == null) {
      return assets
        .map(toOption)
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    }
    const idSet = new Set(boundedAssetIds);
    for (const id of value.linkedAssetIds) idSet.add(id);
    return assets
      .filter((a) => idSet.has(a.id))
      .map(toOption)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [boundedAssetIds, value.linkedAssetIds]);

  const vulnerabilityOptions = useMemo((): IdLabelOption[] => {
    const toOption = (v: (typeof vulnerabilities)[number]): IdLabelOption => ({
      id: v.id,
      label: v.name,
    });
    if (boundedVulnerabilityIds == null) {
      return vulnerabilities
        .map(toOption)
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    }
    const idSet = new Set(boundedVulnerabilityIds);
    for (const id of value.linkedVulnerabilityIds) idSet.add(id);
    return vulnerabilities
      .filter((v) => idSet.has(v.id))
      .map(toOption)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [boundedVulnerabilityIds, value.linkedVulnerabilityIds]);

  const selectedAssets = useMemo((): IdLabelOption[] => {
    return value.linkedAssetIds
      .map((id) => assetOptions.find((o) => o.id === id))
      .filter((o): o is IdLabelOption => o != null);
  }, [value.linkedAssetIds, assetOptions]);

  const selectedVulnerabilities = useMemo((): IdLabelOption[] => {
    return value.linkedVulnerabilityIds
      .map((id) => vulnerabilityOptions.find((o) => o.id === id))
      .filter((o): o is IdLabelOption => o != null);
  }, [value.linkedVulnerabilityIds, vulnerabilityOptions]);

  return (
    <Stack
      gap={3}
      component="form"
      aria-label="Threat filters"
      onSubmit={(e) => e.preventDefault()}
    >
      <MultiSelectField
        label="Source"
        idSuffix="source"
        value={value.sourceDomains}
        onChange={(next) => onChange({ ...value, sourceDomains: next })}
        options={domainOptions}
        emptyPlaceholder="All sources"
      />

      <MultiSelectField
        label="Created by"
        idSuffix="created-by"
        value={value.createdByNames}
        onChange={(next) => onChange({ ...value, createdByNames: next })}
        options={createdByOptions}
        emptyPlaceholder="All people"
      />

      <MultiSelectField
        label="Last updated by"
        idSuffix="last-updated-by"
        value={value.lastUpdatedByNames}
        onChange={(next) => onChange({ ...value, lastUpdatedByNames: next })}
        options={lastUpdatedByOptions}
        emptyPlaceholder="All people"
      />

      <FormControl fullWidth margin="none">
        <Autocomplete
          multiple
          id="filter-threats-assets"
          options={assetOptions}
          value={selectedAssets}
          onChange={(_, newValue) =>
            onChange({
              ...value,
              linkedAssetIds: (newValue as IdLabelOption[]).map((o) => o.id),
            })
          }
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Assets" placeholder="Search assets..." margin="none" />
          )}
        />
      </FormControl>

      <FormControl fullWidth margin="none">
        <Autocomplete
          multiple
          id="filter-threats-vulnerabilities"
          options={vulnerabilityOptions}
          value={selectedVulnerabilities}
          onChange={(_, newValue) =>
            onChange({
              ...value,
              linkedVulnerabilityIds: (newValue as IdLabelOption[]).map((o) => o.id),
            })
          }
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vulnerabilities"
              placeholder="Search vulnerabilities..."
              margin="none"
            />
          )}
        />
      </FormControl>
    </Stack>
  );
}

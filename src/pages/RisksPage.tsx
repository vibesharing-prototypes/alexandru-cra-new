import { useCallback, useMemo, useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import { Container, Stack } from "@mui/material";
import { NavLink } from "react-router";

import FilterRisks from "../components/FilterRisks.js";
import FilterSideSheet from "../components/FilterSideSheet.js";
import RisksHeroSection from "../components/RisksHeroSection.js";
import RisksTable from "../components/RisksTable.js";
import {
  applyCyberRiskFilters,
  buildCyberRiskRows,
  CYBER_RISK_WORKFLOW_FILTER_OPTIONS,
  EMPTY_CYBER_RISK_TABLE_FILTERS,
  type CyberRiskTableFilters,
} from "../utils/cyberRiskTableRows.js";

function hasAnyFilterSelected(f: CyberRiskTableFilters): boolean {
  return (
    f.workflowStatuses.length > 0 ||
    f.ownerIds.length > 0 ||
    f.scoreLabels.length > 0 ||
    f.assetIds.length > 0
  );
}

export default function RisksPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CyberRiskTableFilters>(
    EMPTY_CYBER_RISK_TABLE_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<CyberRiskTableFilters>(
    EMPTY_CYBER_RISK_TABLE_FILTERS,
  );

  const allRows = useMemo(() => buildCyberRiskRows(), []);
  const filteredRows = useMemo(
    () => applyCyberRiskFilters(allRows, appliedFilters),
    [allRows, appliedFilters],
  );

  const hasCommittedFilters = useMemo(
    () => hasAnyFilterSelected(appliedFilters),
    [appliedFilters],
  );
  const hasDraftFilterSelection = useMemo(
    () => hasAnyFilterSelected(draftFilters),
    [draftFilters],
  );
  const hasClearableFilterState = hasCommittedFilters || hasDraftFilterSelection;

  const handleOpenFilters = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  }, [appliedFilters]);

  const handleCloseSheet = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(false);
  }, [appliedFilters]);

  const handleDiscard = useCallback(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const handleClearFilters = useCallback(() => {
    setDraftFilters(EMPTY_CYBER_RISK_TABLE_FILTERS);
    setAppliedFilters(EMPTY_CYBER_RISK_TABLE_FILTERS);
  }, []);

  const handleApply = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  }, [draftFilters]);

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

        <RisksHeroSection />

        <RisksTable rows={filteredRows} onOpenFilters={handleOpenFilters} />
      </Stack>

      <FilterSideSheet
        open={isFilterOpen}
        onClose={handleCloseSheet}
        onApply={handleApply}
        onClear={handleClearFilters}
        onDiscard={handleDiscard}
        hasClearableFilterState={hasClearableFilterState}
        hasDraftFilterSelection={hasDraftFilterSelection}
        titleId="cyber-risks-filters-title"
        contentAriaLabel="Cyber risks filters"
      >
        <FilterRisks
          value={draftFilters}
          onChange={setDraftFilters}
          workflowOptions={CYBER_RISK_WORKFLOW_FILTER_OPTIONS}
        />
      </FilterSideSheet>
    </Container>
  );
}

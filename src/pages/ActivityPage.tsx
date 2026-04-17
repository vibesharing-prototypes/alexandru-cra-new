import { useState } from "react";
import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import { Box, Stack, Tab, Tabs, useTheme } from "@mui/material";
import { NavLink, useLocation } from "react-router";

import AiContentCard, {
  AiContentCardAssessmentPreset,
} from "../components/AiContentCard.js";
import ScoringRationaleDropdowns from "../components/ScoringRationaleDropdowns.js";
import LabelScoreLegend from "../components/LabelScoreLegend.js";
import PageLayout from "../components/PageLayout.js";
import { ScopeCard } from "../components/ScopeCard.js";
import { assets } from "../data/assets.js";
import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

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
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
}

const TAB_LABELS = ["Tab 1", "Tab 2", "Tab 3"] as const;

export default function ActivityPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const { presets } = useTheme();
  const { TabsPresets } = presets;
  const CardHeaderIcon = presets.CardComponentsPresets?.components?.CardHeaderIcon;
  const scopeCardIcon = CardHeaderIcon ? (
    <CardHeaderIcon icon={<FolderIcon size="lg" aria-hidden />} />
  ) : (
    <FolderIcon size="lg" aria-hidden />
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const breadcrumbItems = [
    {
      id: "current",
      label: "Activity",
      url: location.pathname,
    },
  ];

  return (
    <PageLayout>
      <Stack gap={0} sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}>
        <PageHeader
          pageTitle="Activity"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset Manager</span>}
              items={breadcrumbItems}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
        />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="atlas-size-large"
          aria-label="Activity tabs"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={atlasPageHeaderTabsSlotProps}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasPageHeaderNavigationTabsSx,
          }}
        >
          {TAB_LABELS.map((label, index) => (
            <Tab
              key={label}
              label={label}
              id={`activity-tab-${index}`}
              aria-controls={`activity-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ py: 2, width: "100%" }}>
            <Stack
              sx={({ tokens: t }) => ({
                width: "100%",
                alignItems: "stretch",
                gap: t.core.spacing["3"].value,
              })}
            >
              <AiContentCard>
                <AiContentCardAssessmentPreset />
              </AiContentCard>
              <ScoringRationaleDropdowns />
            </Stack>
          </Box>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ py: 2, width: "100%" }}>
            <Stack
              sx={({ tokens: t }) => ({
                width: "100%",
                alignItems: "stretch",
                gap: t.core.spacing["3"].value,
              })}
            >
              <ScopeCard
                title="Assets"
                icon={scopeCardIcon}
                includedCount={0}
                totalCount={assets.length}
                countNoun="Assets"
                cardActionAriaLabel="Empty variant: no assets included (activity preview)"
              />
              <ScopeCard
                title="Assets"
                icon={scopeCardIcon}
                includedCount={12}
                totalCount={assets.length}
                countNoun="Assets"
                cardActionAriaLabel="Filled variant: assets included (activity preview)"
              />
            </Stack>
          </Box>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ py: 2 }}>
            <LabelScoreLegend
              label="Risk level"
              value={{ numeric: "4", label: "High", rag: "neg03" }}
            />
          </Box>
        </TabPanel>
      </Stack>
    </PageLayout>
  );
}

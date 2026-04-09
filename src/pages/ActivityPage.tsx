import { useState } from "react";
import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { Box, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { NavLink, useLocation } from "react-router";

import PageLayout from "../components/PageLayout.js";
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

function PlaceholderContent({ label }: { label: string }) {
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        variant="body1"
        sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
      >
        {label} content
      </Typography>
    </Box>
  );
}

const TAB_LABELS = ["Tab 1", "Tab 2", "Tab 3"] as const;

export default function ActivityPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const { presets } = useTheme();
  const { TabsPresets } = presets;

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
          <PlaceholderContent label="Tab 1" />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <PlaceholderContent label="Tab 2" />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <PlaceholderContent label="Tab 3" />
        </TabPanel>
      </Stack>
    </PageLayout>
  );
}

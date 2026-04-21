import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Button, Stack, useTheme } from "@mui/material";
import type { ReactNode } from "react";

import MetaTag from "./MetaTag.js";

export type ScoringRationaleHeaderProps = {
  /** Scenario display name (page title). */
  scenarioName: string;
  /** Shown below the title when set (e.g. scenario primary id). */
  scenarioId?: string;
  breadcrumbs: ReactNode;
  onBack: () => void;
  backButtonAriaLabel: string;
  onSave?: () => void;
};

export default function ScoringRationaleHeader({
  scenarioName,
  scenarioId,
  breadcrumbs,
  onBack,
  backButtonAriaLabel,
  onSave,
}: ScoringRationaleHeaderProps) {
  const { tokens } = useTheme();
  const metaRowInset = `calc(${tokens.component.button.iconOnly.medium.width.value} + ${tokens.component.pageHeader.desktop.mainContent.gap.value})`;

  return (
    <Stack
      component="section"
      spacing={0}
      sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}
    >
      <PageHeader
        pageTitle={scenarioName}
        breadcrumbs={breadcrumbs}
        moreButton={
          onSave ? (
            <Button variant="contained" size="medium" onClick={onSave}>
              Save
            </Button>
          ) : undefined
        }
        slotProps={{
          backButton: {
            "aria-label": backButtonAriaLabel,
            onClick: onBack,
          },
        }}
      />
      {scenarioId ? (
        <Stack
          direction="row"
          component="div"
          flexWrap="wrap"
          gap={1}
          sx={{
            alignItems: "center",
            marginBottom: tokens.core.spacing["2"].value,
            paddingInlineStart: metaRowInset,
          }}
        >
          <MetaTag label="Scenario ID" value={scenarioId} />
        </Stack>
      ) : null}
    </Stack>
  );
}

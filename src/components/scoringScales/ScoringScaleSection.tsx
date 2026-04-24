import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import ExpandUpIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandUp";
import { Box, Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

export type ScoringScaleSectionProps = {
  title: string;
  sectionId: string;
  /** Id of the collapsible list of band cards (for aria-controls) */
  detailRegionId: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  /** When true, form fields in children are interactive */
  editing: boolean;
  /** Enter edit mode when not editing; when editing, commit/validate in the parent and return to read-only. */
  onToggleEdit: () => void;
  /** Range bar (always under header when section is shown) */
  rangeBar: ReactNode;
  /** Shown when expanded: band cards */
  children?: ReactNode;
};

/**
 * Collapsible section: chevron, H3, Edit / Save changes, indented range + optional body.
 */
export default function ScoringScaleSection({
  title,
  sectionId,
  detailRegionId,
  expanded,
  onToggleExpanded,
  editing,
  onToggleEdit,
  rangeBar,
  children,
}: ScoringScaleSectionProps) {
  const { tokens: t } = useTheme();
  return (
    <Box component="section" aria-labelledby={sectionId} sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ minWidth: 0 }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
          <IconButton
            type="button"
            onClick={onToggleExpanded}
            size="small"
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            aria-controls={detailRegionId}
            sx={({ tokens: th }) => ({
              color: th.semantic.color.type.default.value,
            })}
          >
            {expanded ? <ExpandUpIcon aria-hidden /> : <ExpandDownIcon aria-hidden />}
          </IconButton>
          <Typography
            id={sectionId}
            component="h3"
            sx={{
              m: 0,
              minWidth: 0,
              flex: 1,
              color: t.semantic.color.type.default.value,
              fontFamily: t.semantic.font.title.h3Lg.fontFamily.value,
              fontSize: 22,
              lineHeight: t.semantic.font.title.h3Lg.lineHeight.value,
              fontWeight: 600,
              letterSpacing: t.semantic.font.title.h3Lg.letterSpacing.value,
            }}
          >
            {title}
          </Typography>
        </Stack>
        <Button
          type="button"
          variant="text"
          size="small"
          startIcon={editing ? undefined : <EditIcon aria-hidden />}
          onClick={onToggleEdit}
          aria-pressed={editing}
        >
          {editing ? "Save changes" : "Edit"}
        </Button>
      </Stack>

      <Box sx={{ pl: 5, pt: 2 }}>
        <Stack gap={2} sx={{ width: "100%" }}>
          {rangeBar}
          <Box
            id={detailRegionId}
            role="group"
            aria-label={`${title} band details`}
            hidden={!expanded}
            aria-hidden={!expanded}
            sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
          >
            {expanded ? children : null}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

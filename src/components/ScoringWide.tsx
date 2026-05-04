import { Box } from "@mui/material";

import ScoringFormulasWide, { type ScoringFormulasWideProps } from "./ScoringFormulasWide.js";
import ScoringScaleWide, { type ScoringScaleWideProps } from "./ScoringScaleWide.js";

export type ScoringWideProps = {
  scoringFormulas?: ScoringFormulasWideProps;
  showScale?: ScoringScaleWideProps;
};

/**
 * Horizontal row: scoring formulas and scoring scale (activity / assessment previews).
 */
export default function ScoringWide({ scoringFormulas, showScale }: ScoringWideProps = {}) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        gap: t.core.spacing["7"].value,
        flexWrap: "nowrap",
        minWidth: 0,
        paddingLeft: t.core.spacing["3"].value,
        paddingRight: t.core.spacing["3"].value,
      })}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <ScoringFormulasWide {...{ shrinkToContent: true, ...scoringFormulas }} />
      </Box>
      <Box
        sx={{
          flex: "0 0 200px",
          width: 200,
          minWidth: 200,
          maxWidth: 200,
          boxSizing: "border-box",
        }}
      >
        <ScoringScaleWide {...showScale} />
      </Box>
    </Box>
  );
}

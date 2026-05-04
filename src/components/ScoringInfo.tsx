import { Box } from "@mui/material";

import AggregationMethodRadio, {
  type AggregationMethodRadioProps,
} from "./AggregationMethodRadio.js";
import ScoringFormulas, { type ScoringFormulasProps } from "./ScoringFormulas.js";
import ShowScoringScale, { type ShowScoringScaleProps } from "./ShowScoringScale.js";

export type ScoringInfoProps = {
  aggregationMethodRadio?: AggregationMethodRadioProps;
  scoringFormulas?: ScoringFormulasProps;
  showScoringScale?: ShowScoringScaleProps;
};

/**
 * Horizontal row: aggregation method, scoring formulas, and scoring scale (activity / assessment previews).
 */
export default function ScoringInfo({
  aggregationMethodRadio,
  scoringFormulas,
  showScoringScale,
}: ScoringInfoProps = {}) {
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
          width: "100%",
          maxWidth: 200,
          minWidth: 0,
          alignSelf: "stretch",
        }}
      >
        <AggregationMethodRadio {...aggregationMethodRadio} />
      </Box>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <ScoringFormulas {...{ shrinkToContent: true, ...scoringFormulas }} />
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
        <ShowScoringScale {...showScoringScale} />
      </Box>
    </Box>
  );
}

import { Box } from "@mui/material";

import AggregationMethodRadio, {
  type AggregationMethodRadioProps,
} from "./AggregationMethodRadio.js";
import ScoringFormulas, { type ScoringFormulasProps } from "./ScoringFormulas.js";
import ScoringScaleInfo, { type ScoringScaleInfoProps } from "./ScoringScaleInfo.js";

export type ScoringInfoProps = {
  aggregationMethodRadio?: AggregationMethodRadioProps;
  scoringFormulas?: ScoringFormulasProps;
  scoringScaleInfo?: ScoringScaleInfoProps;
};

/**
 * Horizontal row matching Figma (ITRM — AI scoring content): aggregation method, scoring scale, scoring formulas.
 */
export default function ScoringInfo({
  aggregationMethodRadio,
  scoringFormulas,
  scoringScaleInfo,
}: ScoringInfoProps = {}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        flexWrap: "nowrap",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          width: "fit-content",
          minWidth: 0,
          maxWidth: "100%",
          alignSelf: "flex-start",
        }}
      >
        <AggregationMethodRadio {...aggregationMethodRadio} />
      </Box>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "fit-content",
          minWidth: 0,
          maxWidth: "100%",
          alignSelf: "flex-start",
        }}
      >
        <ScoringScaleInfo {...scoringScaleInfo} />
      </Box>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "fit-content",
          minWidth: 0,
          maxWidth: "100%",
          alignSelf: "flex-start",
        }}
      >
        <ScoringFormulas {...{ shrinkToContent: true, ...scoringFormulas }} />
      </Box>
    </Box>
  );
}

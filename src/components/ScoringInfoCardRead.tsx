import { useMemo } from "react";
import { Box } from "@mui/material";

import type { AggregationMethodRadioProps } from "./AggregationMethodRadio.js";
import ScoringInfo, { type ScoringInfoProps } from "./ScoringInfo.js";

import type { CraScenarioScoreAggregationMethod } from "../data/craAssessmentDraftTypes.js";

export type ScoringInfoCardReadProps = ScoringInfoProps & {
  /**
   * Same value as the Scoring tab aggregation (`scenarioScoreAggregationMethod` from the assessment draft).
   * Aggregation radios are always disabled; pass this so the selection matches what the user chose when scoring.
   */
  aggregationMethod?: CraScenarioScoreAggregationMethod;
};

/**
 * Bordered scoring details card (aggregation, formulas, scale) without the AI header row.
 * Aggregation method radios are always disabled; supply {@link aggregationMethod} (and optional `name` via
 * `aggregationMethodRadio`) so the selection mirrors the Scoring tab.
 */
export default function ScoringInfoCardRead({
  aggregationMethod,
  aggregationMethodRadio,
  scoringFormulas,
  scoringScaleInfo,
}: ScoringInfoCardReadProps = {}) {
  const readOnlyAggregationRadio = useMemo((): AggregationMethodRadioProps => {
    const base = aggregationMethodRadio ?? {};
    const value = aggregationMethod ?? base.value;
    if (value === undefined) {
      return { ...base, disabled: true };
    }
    return {
      ...base,
      value,
      disabled: true,
      onValueChange: base.onValueChange ?? (() => {}),
    };
  }, [aggregationMethod, aggregationMethodRadio]);

  return (
    <Box
      sx={({ tokens: t }) => ({
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: t.semantic.radius.lg.value,
        borderWidth: t.semantic.borderWidth.thin.value,
        borderStyle: "solid",
        borderColor: t.semantic.color.ui.divider.default.value,
        backgroundColor: t.semantic.color.background.base.value,
        px: t.core.spacing["3"].value,
        py: t.core.spacing["2"].value,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: t.core.spacing["4"].value,
      })}
    >
      <ScoringInfo
        aggregationMethodRadio={readOnlyAggregationRadio}
        scoringFormulas={scoringFormulas}
        scoringScaleInfo={scoringScaleInfo}
      />
    </Box>
  );
}

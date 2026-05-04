import { useState } from "react";
import { Box } from "@mui/material";

import RadioButtonArray from "./RadioButtonArray.js";

import type { CraScenarioScoreAggregationMethod } from "../data/craAssessmentDraftTypes.js";

export type AggregationMethodRadioProps = {
  /**
   * Controlled value (use with `onValueChange`). When omitted, selection is stored locally.
   * `average` uses arithmetic mean of scenario Impact / Threat / Vulnerability for parent rows.
   */
  value?: CraScenarioScoreAggregationMethod;
  /** Fired when the user changes the aggregation method (controlled mode). */
  onValueChange?: (value: CraScenarioScoreAggregationMethod) => void;
  /** Passed to the underlying `RadioGroup` `name` (e.g. to pair with a second group sharing the same React state). */
  name?: string;
  /** When true, radios are not interactive. */
  disabled?: boolean;
};

/** Aggregation radios (sibling to formulas block under the AI scoring section). */
export default function AggregationMethodRadio({
  value: controlledValue,
  onValueChange,
  name: radioName,
  disabled = false,
}: AggregationMethodRadioProps = {}) {
  const [internal, setInternal] = useState<CraScenarioScoreAggregationMethod>("highest");
  const isControlled = controlledValue !== undefined && onValueChange !== undefined;
  const aggregationMethod = isControlled ? controlledValue : internal;

  const handleChange = (v: string) => {
    if (v !== "highest" && v !== "average") return;
    if (isControlled) {
      onValueChange(v);
    } else {
      setInternal(v);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 200,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <RadioButtonArray
        label="Aggregation method"
        options={[
          { value: "highest", label: "Highest" },
          { value: "average", label: "Average" },
        ]}
        name={radioName}
        value={aggregationMethod}
        onChange={handleChange}
        disabled={disabled}
        showAction={false}
        row={false}
      />
    </Box>
  );
}

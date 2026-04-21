import { Box, Stack, Typography } from "@mui/material";

export type LabelValueProps = {
  /** The descriptive label above the value (muted, small) */
  label: string;
  /** The main value to display (emphasized, small) */
  value: string;
};

/**
 * A simple label-value pair component following strict layout and typography tokens.
 * Matches design spec: Column layout, 32px total height, Jakarta Sans 11px font.
 */
export default function LabelValue({ label, value }: LabelValueProps) {
  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      sx={{
        padding: 0,
        width: "fit-content",
        minHeight: 32,
        flex: "none",
      }}
    >
      {/* Label section: 16px height, Jakarta Sans 11px, weight 400, muted color */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: 16,
        }}
      >
        <Typography
          variant="labelXs"
          sx={({ tokens: t }) => ({
            m: 0,
            fontSize: "11px",
            lineHeight: "16px",
            letterSpacing: "0.4px",
            fontWeight: 400,
            color: t.semantic.color.type.muted.value,
          })}
        >
          {label}
        </Typography>
      </Box>

      {/* Values section: 16px height, Jakarta Sans 11px, weight 600, default color */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: 16,
        }}
      >
        <Typography
          variant="labelXs"
          sx={({ tokens: t }) => ({
            m: 0,
            fontSize: "11px",
            lineHeight: "16px",
            letterSpacing: "0.4px",
            fontWeight: 600,
            color: t.semantic.color.type.default.value,
          })}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

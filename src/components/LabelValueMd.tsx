import { Box, Stack, Typography } from "@mui/material";

export type LabelValueMdProps = {
  /** Muted label (Semantic/Font/Text/Md, weight 400). */
  label: string;
  /** Emphasized value (Semantic/Font/Text/Md emphasis, weight 600). */
  value: string;
};

/**
 * Label-value pair using larger Text/Md typography (vs {@link LabelValue} label-xs).
 * Layout: column flex, 4px gap; 20px line rows; full-width friendly (no fixed Figma frame widths).
 */
export default function LabelValueMd({ label, value }: LabelValueMdProps) {
  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      sx={{
        p: 0,
        width: "fit-content",
        maxWidth: "100%",
        flex: "none",
        gap: ({ tokens: t }) => t.core.spacing["0_5"].value,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          p: 0,
          minHeight: ({ tokens: t }) => t.semantic.font.text.md.lineHeight.value,
        }}
      >
        <Typography
          component="span"
          sx={({ tokens: t }) => ({
            m: 0,
            fontFamily: "inherit",
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            fontWeight: 400,
            color: t.semantic.color.type.muted.value,
          })}
        >
          {label}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          p: 0,
          gap: ({ tokens: t }) => t.core.spacing["1"].value,
          minHeight: ({ tokens: t }) => t.semantic.font.text.md.lineHeight.value,
        }}
      >
        <Typography
          component="span"
          sx={({ tokens: t }) => ({
            m: 0,
            fontFamily: "inherit",
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
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

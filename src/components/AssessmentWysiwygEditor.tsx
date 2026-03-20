import {
  Box,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import AttachIcon from "@diligentcorp/atlas-react-bundle/icons/Attach";
import AudioIcon from "@diligentcorp/atlas-react-bundle/icons/Audio";
import BlockquoteIcon from "@diligentcorp/atlas-react-bundle/icons/Blockquote";
import ClearFormatIcon from "@diligentcorp/atlas-react-bundle/icons/ClearFormat";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import FormatAlignLeftIcon from "@diligentcorp/atlas-react-bundle/icons/FormatAlignLeft";
import FormatBoldIcon from "@diligentcorp/atlas-react-bundle/icons/FormatBold";
import FormatColorTextIcon from "@diligentcorp/atlas-react-bundle/icons/FormatColorText";
import FormatIndentDecreaseIcon from "@diligentcorp/atlas-react-bundle/icons/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@diligentcorp/atlas-react-bundle/icons/FormatIndentIncrease";
import FormatItalicIcon from "@diligentcorp/atlas-react-bundle/icons/FormatItalic";
import FormatStrikethroughIcon from "@diligentcorp/atlas-react-bundle/icons/FormatStrikethrough";
import FormatUnderlinedIcon from "@diligentcorp/atlas-react-bundle/icons/FormatUnderlined";
import HighlighterIcon from "@diligentcorp/atlas-react-bundle/icons/Highlighter";
import ImageIcon from "@diligentcorp/atlas-react-bundle/icons/Image";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import TableAlternativeIcon from "@diligentcorp/atlas-react-bundle/icons/TableAlternative";
import UnlinkIcon from "@diligentcorp/atlas-react-bundle/icons/Unlink";
import VideoIcon from "@diligentcorp/atlas-react-bundle/icons/Video";

function WysiwygToolbar() {
  const tool = (label: string, Icon: React.ComponentType<{ "aria-hidden"?: boolean }>) => (
    <IconButton size="small" aria-label={label} sx={{ borderRadius: 1 }}>
      <Icon aria-hidden />
    </IconButton>
  );

  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.5,
        py: 0.5,
        px: 0.5,
        borderBottom: `1px solid ${t.semantic.color.outline.default.value}`,
      })}
    >
      {tool("Bold", FormatBoldIcon)}
      {tool("Italic", FormatItalicIcon)}
      {tool("Underline", FormatUnderlinedIcon)}
      {tool("Strikethrough", FormatStrikethroughIcon)}
      {tool("Text color", FormatColorTextIcon)}
      {tool("Highlight", HighlighterIcon)}
      {tool("Clear formatting", ClearFormatIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      <IconButton size="small" aria-label="Alignment" sx={{ borderRadius: 1 }}>
        <FormatAlignLeftIcon aria-hidden />
      </IconButton>
      <IconButton size="small" aria-label="Alignment options" sx={{ borderRadius: 1 }}>
        <ExpandDownIcon aria-hidden />
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      <IconButton size="small" aria-label="List" sx={{ borderRadius: 1 }}>
        <ListIcon aria-hidden />
      </IconButton>
      <IconButton size="small" aria-label="List options" sx={{ borderRadius: 1 }}>
        <ExpandDownIcon aria-hidden />
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Increase indent", FormatIndentIncreaseIcon)}
      {tool("Decrease indent", FormatIndentDecreaseIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Table", TableAlternativeIcon)}
      {tool("Blockquote", BlockquoteIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Attach file", AttachIcon)}
      {tool("Insert link", LinkIcon)}
      {tool("Remove link", UnlinkIcon)}
      {tool("Insert image", ImageIcon)}
      {tool("Insert video", VideoIcon)}
      {tool("Insert audio", AudioIcon)}
    </Box>
  );
}

export type AssessmentWysiwygEditorProps = {
  /** Stable id for label / input association (no spaces). */
  fieldId: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  /** When true, the field is display-only (toolbar remains for visual parity with design). */
  readOnly?: boolean;
  "aria-label": string;
};

/**
 * Prototype rich-text-style field with formatting toolbar (toolbar actions are non-functional).
 */
export default function AssessmentWysiwygEditor({
  fieldId,
  label,
  required = false,
  placeholder,
  value,
  onChange,
  minRows = 10,
  readOnly = false,
  "aria-label": ariaLabel,
}: AssessmentWysiwygEditorProps) {
  const labelId = `${fieldId}-label`;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          id={labelId}
          variant="caption"
          component="label"
          htmlFor={fieldId}
          fontWeight={600}
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.default.value,
            letterSpacing: "0.3px",
          })}
        >
          {label}
        </Typography>
        {required ? (
          <Typography
            variant="caption"
            sx={({ tokens: t }) => ({
              color: t.semantic.color.type.muted.value,
              letterSpacing: "0.3px",
            })}
          >
            (Required)
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={({ tokens: t }) => ({
          border: `1px solid ${t.semantic.color.outline.default.value}`,
          borderRadius: t.semantic.radius.md.value,
          overflow: "hidden",
        })}
      >
        <Box sx={readOnly ? { pointerEvents: "none", opacity: 0.85 } : undefined}>
          <WysiwygToolbar />
        </Box>
        <TextField
          id={fieldId}
          multiline
          fullWidth
          minRows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          variant="standard"
          InputProps={{ disableUnderline: true, readOnly }}
          sx={{ px: 1.5, py: 1.5 }}
          aria-label={ariaLabel}
          slotProps={{
            input: {
              "aria-labelledby": labelId,
            },
          }}
        />
      </Box>
    </Box>
  );
}

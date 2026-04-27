import { useId, type MouseEvent, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import {
  Box,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

export type RadioButtonArrayOption = { value: string; label: string };

export type RadioButtonArrayProps = {
  /** Text or node shown above the radio group */
  label: ReactNode;
  /** Two or more radio options */
  options: readonly RadioButtonArrayOption[];
  /** Selected option `value` */
  value: string;
  onChange: (value: string) => void;
  /** Optional group `name` for the radio field (a unique name is generated if omitted) */
  name?: string;
  /** When false, the vertical divider and action area are omitted */
  showAction?: boolean;
  /** When false, the leading icon in the action area is hidden (link text is still shown when `showActionText` is set) */
  showIcon?: boolean;
  /** When false, the default action link is not shown (no icon-only state; the action region is omitted unless `actionSlot` is set) */
  showActionText?: boolean;
  /** Link destination for the default action (use `"#"` for inert hash; click is prevented) */
  actionHref?: string;
  /** Text for the default action (link, or static copy when `actionTextPlain` is true) */
  actionText?: string;
  /** When true, `actionText` is rendered as body copy, not a link. */
  actionTextPlain?: boolean;
  /** Optional custom icon node (defaults to the outline “info in circle” glyph). Shown only when link text is visible. */
  actionIcon?: ReactNode;
  /** Replaces the entire action region (right of the divider), including icon and link */
  actionSlot?: ReactNode;
  /** When true, radios and action links are non-interactive. */
  disabled?: boolean;
};

function AggregationMethodDivider() {
  return (
    <Box
      aria-hidden
      sx={{
        flex: "0 0 1px",
        width: 1,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={({ tokens: t }) => ({
          width: 1,
          height: 12,
          flexShrink: 0,
          bgcolor: t.semantic.color.ui.divider.default.value,
        })}
      />
    </Box>
  );
}

function DefaultInfoOutlineIcon() {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      aria-hidden
      sx={({ tokens: t }) => ({
        width: 20,
        height: 20,
        color: t.semantic.color.type.muted.value,
        flexShrink: 0,
      })}
    >
      <path
        fill="currentColor"
        d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      />
    </SvgIcon>
  );
}

/**
 * Label, horizontal radio group, vertical divider, and optional icon + action link.
 * Default action text is required to show the icon+link area (icon never appears without link text).
 */
export default function RadioButtonArray({
  label,
  options,
  value,
  onChange,
  name: nameProp,
  showAction = true,
  showIcon = true,
  showActionText = true,
  actionHref,
  actionText = "",
  actionTextPlain = false,
  actionIcon,
  actionSlot,
  disabled = false,
}: RadioButtonArrayProps) {
  if (import.meta.env.DEV && options.length < 2) {
    // eslint-disable-next-line no-console
    console.warn("RadioButtonArray: pass at least two `options`.");
  }
  const id = useId();
  const labelId = `${id}-label`;
  const groupName = nameProp ?? `${id}-radio-group`;

  const hasCustomAction = actionSlot != null;
  const hasDefaultActionText = showActionText && actionText.trim().length > 0;
  const hasDefaultAction = !hasCustomAction && hasDefaultActionText;
  const showActionRegion = showAction && (hasCustomAction || hasDefaultAction);
  const linkTarget = actionHref ?? "#";

  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: t.core.spacing["2"].value,
        width: "fit-content",
        minHeight: 52,
        boxSizing: "border-box",
      })}
    >
      <Stack
        sx={({ tokens: t }) => ({
          width: "fit-content",
          flexShrink: 0,
          alignItems: "flex-start",
          boxSizing: "border-box",
          gap: t.core.spacing["1_5"].value,
        })}
      >
        <Typography
          id={labelId}
          component="p"
          variant="labelSm"
          sx={({ tokens: t }) => ({
            m: 0,
            fontWeight: t.semantic.fontWeight.emphasis.value,
            color: t.semantic.color.type.default.value,
          })}
        >
          {label}
        </Typography>
        <FormControl sx={{ width: "100%", m: 0, height: 28 }} disabled={disabled}>
          <RadioGroup
            row
            name={groupName}
            value={value}
            onChange={(_e, v) => onChange(v)}
            aria-labelledby={labelId}
            sx={{
              flexWrap: "wrap",
              gap: 2,
              columnGap: 2,
              rowGap: 1,
            }}
          >
            {options.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio disabled={disabled} />}
                label={opt.label}
                sx={{
                  height: 28,
                  mr: 0,
                  ml: 0,
                  "& .MuiFormControlLabel-label": ({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    color: t.semantic.color.type.default.value,
                  }),
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Stack>

      {showActionRegion ? (
        <>
          <AggregationMethodDivider />
          {actionSlot != null ? (
            actionSlot
          ) : hasDefaultAction ? (
            <Box
              sx={({ tokens: t }) => ({
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: t.core.spacing["0_5"].value,
                minHeight: 24,
                minWidth: 0,
                flex: "1 1 200px",
                pointerEvents: disabled ? "none" : undefined,
                opacity: disabled ? 0.72 : undefined,
              })}
            >
              {showIcon ? (actionIcon ?? <DefaultInfoOutlineIcon />) : null}
              {actionTextPlain ? (
                <Typography
                  component="p"
                  variant="textSm"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    width: "100%",
                    minWidth: 0,
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    fontWeight: t.core.fontWeight.regular.value,
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  {actionText}
                </Typography>
              ) : linkTarget === "#" ? (
                <Link
                  href="#"
                  underline="hover"
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => e.preventDefault()}
                  sx={({ tokens: t }) => ({
                    width: 300,
                    minWidth: 300,
                    height: "fit-content",
                    fontSize: t.semantic.font.text.sm.fontSize.value,
                    lineHeight: t.semantic.font.text.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
                    fontWeight: t.core.fontWeight.semiBold.value,
                    color: t.semantic.color.action.link.default.value,
                  })}
                >
                  {actionText}
                </Link>
              ) : (
                <Link
                  component={RouterLink}
                  to={linkTarget}
                  underline="hover"
                  sx={({ tokens: t }) => ({
                    width: 300,
                    minWidth: 300,
                    height: "fit-content",
                    fontSize: t.semantic.font.text.sm.fontSize.value,
                    lineHeight: t.semantic.font.text.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
                    fontWeight: t.core.fontWeight.semiBold.value,
                    color: t.semantic.color.action.link.default.value,
                  })}
                >
                  {actionText}
                </Link>
              )}
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}

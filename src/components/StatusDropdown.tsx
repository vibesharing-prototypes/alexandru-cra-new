import { StatusIndicator } from "@diligentcorp/atlas-react-bundle";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import { Box, Menu, MenuItem, useTheme } from "@mui/material";
import { useRef, useState } from "react";

/** Matches control status colours in `ControlsPage.tsx` (`STATUS_COLOR_MAP`). */
export const CONTROL_STATUS_INDICATOR_COLORS: Record<
  "Draft" | "Active" | "Archived",
  "success" | "generic" | "subtle"
> = {
  Active: "success",
  Archived: "generic",
  Draft: "subtle",
};

type StatusIndicatorColor = (typeof CONTROL_STATUS_INDICATOR_COLORS)["Draft"];

interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  "aria-label"?: string;
}

function statusColorForLabel(label: string): StatusIndicatorColor {
  return (
    CONTROL_STATUS_INDICATOR_COLORS[label as keyof typeof CONTROL_STATUS_INDICATOR_COLORS] ??
    "subtle"
  );
}

/**
 * Displays the current status as a StatusIndicator chip with an expand chevron.
 * Clicking opens a dropdown menu to select a new status value.
 *
 * Chip colours follow the control status mapping (Draft → subtle, Active → success,
 * Archived → generic). Unknown labels fall back to subtle.
 */
export default function StatusDropdown({
  value,
  options,
  onChange,
  "aria-label": ariaLabel = "Status",
}: StatusDropdownProps) {
  const { tokens } = useTheme();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSelect = (option: string) => {
    onChange(option);
    handleClose();
  };

  return (
    <>
      <Box
        ref={anchorRef}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          userSelect: "none",
          "&:focus-visible": {
            outline: `2px solid ${tokens.semantic.color.ui.focusRing.value}`,
            outlineOffset: 2,
            borderRadius: 1,
          },
        }}
      >
        <StatusIndicator color={statusColorForLabel(value)} label={value} />
        <Box
          aria-hidden
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: tokens.semantic.color.type.muted.value,
          }}
        >
          <ExpandDownIcon />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            role: "listbox",
            "aria-label": ariaLabel,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === value}
            role="option"
            aria-selected={option === value}
            onClick={() => handleSelect(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

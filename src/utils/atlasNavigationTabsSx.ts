import type { TabsProps } from "@mui/material/Tabs";

const zeroGap = {
  gap: "0px !important",
  columnGap: "0px !important",
  rowGap: "0px !important",
} as const;

/**
 * Theme baseline must not stack with the root borderBottom — hide pseudo-elements
 * on nested slots (Atlas uses ::after on the tabs root/list in some builds).
 */
const hidePseudoDividers = {
  borderBottom: "none",
  "&::after": { display: "none !important" },
  "&::before": { display: "none !important" },
} as const;

/**
 * Aligns with Atlas Storybook navigation tabs: removes token gap between tab labels.
 * Use with `slotProps` so overrides win over `MuiTabs` `list` slot styles from the theme.
 * The baseline divider and scroll-button masking come from the Atlas theme (MuiTabs root ::after).
 */
export const atlasNavigationTabsSx = {
  "& .MuiTabs-flexContainer": { ...zeroGap },
  "& .MuiTabs-list": { ...zeroGap },
};

/**
 * Direct `list` slot styles — required in MUI 6+ because theme `styleOverrides.list` can outrank
 * nested selectors from `sx` on the Tabs root.
 */
export const atlasNavigationTabsSlotProps = {
  list: {
    sx: { ...zeroGap },
  },
} satisfies Pick<TabsProps, "slotProps">["slotProps"];

type TokensArg = {
  tokens: {
    semantic: {
      borderWidth: { thin: { value: string } };
      color: { ui: { divider: { default: { value: string } } } };
    };
  };
};

/**
 * Full-width Atlas navigation tabs under a page header: one divider on the `Tabs` root
 * (so the selection indicator aligns with it — avoids a wrapper border + inner baseline double line).
 * Pseudo-element baselines from the theme are disabled so they do not stack with this border.
 *
 * Atlas also draws a 1px `::after` on each `MuiTab` root for the row baseline. When we replace the
 * theme's `MuiTabs` root `::after` with an explicit `borderBottom`, those tab-level `::after` lines
 * would stack on the same row and read as a double divider — hide them for **non-selected** tabs
 * only. The selected tab's accent line is also implemented with `::after` (`createUnderline` in the
 * theme); hiding every `MuiTab-root::after` would remove that indicator.
 */
export const atlasPageHeaderNavigationTabsSx = {
  ...atlasNavigationTabsSx,
  position: "relative",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  paddingInlineStart: 0,
  marginInline: 0,
  marginLeft: 0,
  marginRight: 0,
  borderBottom: ({ tokens: t }: TokensArg) =>
    `${t.semantic.borderWidth.thin.value} solid ${t.semantic.color.ui.divider.default.value}`,
  "&::after": { display: "none !important" },
  "&::before": { display: "none !important" },
  "& .MuiTab-root:not(.Mui-selected)::after": { display: "none !important" },
  "& .MuiTabs-flexContainer": { ...zeroGap, borderBottom: "none" },
  "& .MuiTabs-list": { ...zeroGap, ...hidePseudoDividers },
  "& .MuiTabs-scroller": { marginInline: 0 },
};

/**
 * `list` slot overrides so theme baselines do not add a second line under the tab row.
 */
export const atlasPageHeaderTabsSlotProps = {
  list: {
    sx: {
      ...zeroGap,
      ...hidePseudoDividers,
    },
  },
} satisfies Pick<TabsProps, "slotProps">["slotProps"];

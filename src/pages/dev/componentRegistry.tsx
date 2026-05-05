import type { ReactNode } from "react";

import { SHOWCASE_COMPONENTS } from "./showcaseDefinitions.js";
import { renderShowcaseComponent } from "./showcaseRenderers.js";
import { usageForSlug } from "./showcaseUsages.js";

export type ComponentEntry = {
  slug: string;
  name: string;
  render: () => ReactNode;
  usedInPages: { label: string; path: string }[];
  usedInComponents: string[];
};

export const COMPONENT_REGISTRY: ComponentEntry[] = SHOWCASE_COMPONENTS.map(
  ({ slug, name }) => {
    const { usedInPages, usedInComponents } = usageForSlug(slug);
    return {
      slug,
      name,
      render: () => renderShowcaseComponent(slug),
      usedInPages,
      usedInComponents,
    };
  },
);

export const registryBySlug = new Map(
  COMPONENT_REGISTRY.map((e) => [e.slug, e]),
);

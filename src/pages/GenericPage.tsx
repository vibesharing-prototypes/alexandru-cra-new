import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { NavLink, useLocation } from "react-router";

import PageLayout from "../components/PageLayout.js";
import Placeholder from "../components/Placeholder.js";

interface GenericPageProps {
  title: string;
  subtitle?: string;
  breadcrumbParent?: string;
}

export default function GenericPage({
  title,
  subtitle,
  breadcrumbParent,
}: GenericPageProps) {
  const location = useLocation();

  const breadcrumbItems = [];
  if (breadcrumbParent) {
    breadcrumbItems.push({
      id: "parent",
      label: breadcrumbParent,
      url: location.pathname.split("/").slice(0, -1).join("/") || "/",
    });
  }
  breadcrumbItems.push({
    id: "current",
    label: title,
    url: location.pathname,
  });

  return (
    <PageLayout>
      <PageHeader
        pageTitle={title}
        pageSubtitle={subtitle}
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>Asset Manager</span>}
            items={breadcrumbItems}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
          </OverflowBreadcrumbs>
        }
      />
      <Placeholder>{title}</Placeholder>
    </PageLayout>
  );
}

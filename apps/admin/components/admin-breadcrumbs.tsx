"use client";

import Link from "next/link";
import { Breadcrumbs, type BreadcrumbItem } from "@repo/ui";

type AdminBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <Breadcrumbs
      items={items}
      className="mb-3"
      renderLink={(item, content) => (
        <Link href={item.href ?? "#"} prefetch={false}>
          {content}
        </Link>
      )}
    />
  );
}

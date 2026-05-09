"use client";

import * as React from "react";
import { FaChevronLeft } from "react-icons/fa6";

import { cn } from "../../lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  renderLink?: (item: BreadcrumbItem, content: React.ReactNode) => React.ReactNode;
};

export function Breadcrumbs({ items, className, renderLink }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="breadcrumb" className={cn("w-full", className)}>
      <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? <FaChevronLeft className="size-2.5 text-muted-foreground/80" aria-hidden /> : null}
              {item.href && !isLast ? (
                renderLink ? (
                  renderLink(item, <span className="transition-colors hover:text-foreground">{item.label}</span>)
                ) : (
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                )
              ) : (
                <span className={cn(isLast && "font-medium text-foreground")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

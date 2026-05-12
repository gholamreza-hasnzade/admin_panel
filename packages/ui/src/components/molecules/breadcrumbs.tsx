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
    <nav aria-label="breadcrumb" className={cn("w-full touch-manipulation", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1 sm:gap-1.5">
              {index > 0 ? (
                <FaChevronLeft
                  className="size-2 shrink-0 text-muted-foreground/80 sm:size-2.5 rtl:rotate-180"
                  aria-hidden
                />
              ) : null}
              {item.href && !isLast ? (
                renderLink ? (
                  renderLink(item, (
                    <span className="min-w-0 truncate transition-colors hover:text-foreground">{item.label}</span>
                  ))
                ) : (
                  <a
                    href={item.href}
                    className="min-w-0 touch-manipulation truncate transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                )
              ) : (
                <span className={cn("min-w-0 truncate", isLast && "font-medium text-foreground")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../atoms/button";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showEdges?: boolean;
  className?: string;
  disabled?: boolean;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  showEdges: boolean,
): Array<number | "ellipsis"> {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) return range(1, totalPages);

  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  const items: Array<number | "ellipsis"> = [];

  if (showEdges) items.push(1);

  if (left > 2) {
    items.push("ellipsis");
  } else if (showEdges) {
    items.push(...range(2, left - 1));
  }

  items.push(...range(left, right));

  if (right < totalPages - 1) {
    items.push("ellipsis");
  } else if (showEdges) {
    items.push(...range(right + 1, totalPages - 1));
  }

  if (showEdges && totalPages > 1) items.push(totalPages);

  return items;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEdges = true,
  className,
  disabled = false,
}: PaginationProps) {
  const safeTotal = Math.max(0, totalPages);
  const currentPage = Math.min(Math.max(1, page), Math.max(1, safeTotal));
  const canGoPrev = !disabled && currentPage > 1;
  const canGoNext = !disabled && currentPage < safeTotal;

  const items = React.useMemo(
    () => getPaginationItems(currentPage, safeTotal, siblingCount, showEdges),
    [currentPage, safeTotal, siblingCount, showEdges],
  );

  if (safeTotal <= 1) return null;

  return (
    <nav
      dir="rtl"
      aria-label="Pagination"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-center gap-1 touch-manipulation sm:gap-1.5",
        className,
      )}
    >
      <Button
        size="sm"
        variant="outline"
        disabled={!canGoPrev}
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
      >
        قبلی
      </Button>

      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="shrink-0 select-none px-0.5 text-[11px] text-muted-foreground sm:px-1 sm:text-sm"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            size="sm"
            variant={item === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(item)}
            disabled={disabled}
            aria-current={item === currentPage ? "page" : undefined}
            className="tabular-nums"
          >
            {item}
          </Button>
        ),
      )}

      <Button
        size="sm"
        variant="outline"
        disabled={!canGoNext}
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
      >
        بعدی
      </Button>
    </nav>
  );
}

export { Pagination };

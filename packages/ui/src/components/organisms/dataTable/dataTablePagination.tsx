"use client";

import { useMemo, type ChangeEvent, type ReactNode } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  className?: string;
  variant?: "default" | "bordered" | "striped" | "hover";
  totalCount?: number;
  isLoading?: boolean;
  showRowCount?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className,
  variant = "default",
  totalCount,
  isLoading = false,
  showRowCount = true,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const totalRowCount = table.getCoreRowModel().rows.length;

  const stablePageCount =
    isLoading && pageCount === 0
      ? Math.max(1, Math.ceil((totalCount || 0) / pageSize))
      : Math.max(1, pageCount);

  const resolvedPageSizeOptions = useMemo(() => {
    const set = new Set(pageSizeOptions);
    set.add(pageSize);
    return Array.from(set).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  if (stablePageCount <= 0 || (!isLoading && totalCount === 0)) {
    return null;
  }

  const paginationClasses = cn(
    "px-4 py-3",
    {
      "border-border bg-card border-t":
        variant === "default" || variant === "hover",
      "border-border bg-card rounded-b-lg border border-t-0":
        variant === "bordered",
      "border-border bg-muted/50 border-t": variant === "striped",
    },
    className,
  );

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    if (!Number.isFinite(next)) return;
    table.setPagination((prev) => ({
      ...prev,
      pageSize: next,
      pageIndex: 0,
    }));
  };

  return (
    <div className={paginationClasses}>
      {/*
        dir="ltr" keeps the row-size select + page controls in a stable visual order
        under rtl document layout (avoids fragmented / mirrored flex).
      */}
      <div
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3"
        dir="ltr"
      >
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap text-xs font-medium sm:text-sm">
            Rows
          </span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border-input bg-background text-foreground hover:border-border focus:border-ring focus:ring-ring min-w-[4.5rem] rounded-lg border px-2 py-1.5 text-xs transition-all duration-200 focus:ring-2 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
            aria-label="Rows per page"
          >
            {resolvedPageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="text-muted-foreground shrink-0 text-xs sm:text-sm">
          <span className="text-foreground font-semibold">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-semibold">
            {totalCount ?? table.getFilteredRowModel().rows.length}
          </span>{" "}
          rows
        </div>

        {showRowCount && totalCount === undefined ? (
          <div className="text-muted-foreground shrink-0 text-sm">
            {filteredRowCount} of {totalRowCount} rows
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPreviousPage || isLoading}
            title="First page"
            className={cn(
              "border-input text-foreground hidden h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm lg:flex",
              "hover:border-border hover:bg-accent/60 transition-all duration-200",
              "disabled:hover:border-input disabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
              "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
            )}
          >
            <ChevronsLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage || isLoading}
            title="Previous page"
            className={cn(
              "border-input text-foreground flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm",
              "hover:border-border hover:bg-accent/60 transition-all duration-200",
              "disabled:hover:border-input disabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
              "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
            )}
          >
            <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          <div className="mx-2 flex items-center gap-1">
            {(() => {
              const pages: ReactNode[] = [];
              const currentPage = pageIndex + 1;
              const totalPages = stablePageCount;

              if (totalPages <= 0 || currentPage <= 0) {
                return pages;
              }

              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);

              if (endPage - startPage < 4) {
                if (startPage === 1) {
                  endPage = Math.min(totalPages, startPage + 4);
                } else {
                  startPage = Math.max(1, endPage - 4);
                }
              }

              startPage = Math.min(startPage, totalPages);
              endPage = Math.min(endPage, totalPages);

              if (startPage > 1) {
                pages.push(
                  <button
                    type="button"
                    key={1}
                    onClick={() => table.setPageIndex(0)}
                    className={cn(
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-all duration-200 sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm",
                      "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
                      pageIndex === 0
                        ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "border-input text-foreground hover:border-border hover:bg-accent/60",
                    )}
                  >
                    1
                  </button>,
                );
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="text-muted-foreground px-2 text-sm">
                      ...
                    </span>,
                  );
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    type="button"
                    key={i}
                    onClick={() => table.setPageIndex(i - 1)}
                    disabled={isLoading}
                    className={cn(
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-all duration-200 sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm",
                      "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
                      pageIndex === i - 1
                        ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "border-input text-foreground hover:border-border hover:bg-accent/60",
                    )}
                  >
                    {i}
                  </button>,
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="text-muted-foreground px-2 text-sm">
                      ...
                    </span>,
                  );
                }
                pages.push(
                  <button
                    type="button"
                    key={totalPages}
                    onClick={() => table.setPageIndex(totalPages - 1)}
                    className={cn(
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-all duration-200 sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm",
                      "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
                      pageIndex === totalPages - 1
                        ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "border-input text-foreground hover:border-border hover:bg-accent/60",
                    )}
                  >
                    {totalPages}
                  </button>,
                );
              }

              return pages;
            })()}
          </div>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!canNextPage || isLoading}
            title="Next page"
            className={cn(
              "border-input text-foreground flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium sm:h-9 sm:min-w-[36px] sm:px-3 sm:text-sm",
              "hover:border-border hover:bg-accent/60 transition-all duration-200",
              "disabled:hover:border-input disabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
              "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
            )}
          >
            <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={() => table.setPageIndex(stablePageCount - 1)}
            disabled={!canNextPage || isLoading}
            title="Last page"
            className={cn(
              "border-input text-foreground hidden h-9 min-w-[36px] items-center justify-center rounded-lg border px-3 text-sm font-medium sm:flex",
              "hover:border-border hover:bg-accent/60 transition-all duration-200",
              "disabled:hover:border-input disabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
              "focus:border-ring focus:ring-ring focus:ring-2 focus:outline-none",
            )}
          >
            <ChevronsRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../molecules/tooltip";

export type DataTableTruncatedCellProps = {
  value: string | number | null | undefined;
  /** Tooltip body direction (default RTL for Persian UIs). */
  dir?: "rtl" | "ltr";
};

/**
 * Single-line ellipsis in the cell; full value in a tooltip.
 * Requires a {@link import("../../molecules/tooltip").TooltipProvider} ancestor (DataTable adds one when `autoTruncateTextCells` is on).
 */
export function DataTableTruncatedCell({
  value,
  dir = "rtl",
}: DataTableTruncatedCellProps) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }
  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="block min-w-0 max-w-full cursor-default truncate text-start outline-none"
          tabIndex={0}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent dir={dir} side="top" className="max-w-md">
        <span className="whitespace-pre-wrap break-words text-xs leading-relaxed">
          {text}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

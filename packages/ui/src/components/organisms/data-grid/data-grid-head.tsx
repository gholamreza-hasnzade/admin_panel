"use client";
import * as React from "react";
import type { HeaderGroup } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import { GRID_CLASS } from "./data-grid.constants";
import { DataGridFilterControl } from "./data-grid-filter-control";
type DataGridHeadProps = {
  headerGroups: HeaderGroup<any>[];
  hasActions: boolean;
  actionsHeader: React.ReactNode;
  textFilterInputs: Record<string, string>;
  onTextFilterInputChange: (columnId: string, value: string) => void;
  compact?: boolean;
  showFiltersRow?: boolean;
};
function DataGridHeadComponent({
  headerGroups,
  hasActions,
  actionsHeader,
  textFilterInputs,
  onTextFilterInputChange,
  compact = false,
  showFiltersRow = true,
}: DataGridHeadProps) {
  return (
    <thead className="bg-muted/55">
      {" "}
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {" "}
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortState = header.column.getIsSorted();
            return (
              <th
                key={header.id}
                className={cn(
                  GRID_CLASS.headerCell,
                  compact && "h-10 px-2 text-[11px] md:text-xs",
                  canSort && "group",
                )}
              >
                {" "}
                {canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex w-full items-center justify-between gap-2 text-right transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {" "}
                    <span className="truncate">
                      {" "}
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}{" "}
                    </span>{" "}
                    <span
                      className={cn(
                        "text-[10px] text-muted-foreground/70 transition-opacity",
                        sortState
                          ? "opacity-100"
                          : "opacity-50 group-hover:opacity-80",
                      )}
                      aria-hidden
                    >
                      {" "}
                      {sortState === "asc"
                        ? "▲"
                        : sortState === "desc"
                          ? "▼"
                          : "⇅"}{" "}
                    </span>{" "}
                  </button>
                ) : (
                  <span className="truncate">
                    {" "}
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}{" "}
                  </span>
                )}{" "}
              </th>
            );
          })}{" "}
          {hasActions ? (
            <th className={cn(GRID_CLASS.headerCell, "ps-2 pe-2 text-left")}>
              {" "}
              {actionsHeader}{" "}
            </th>
          ) : null}{" "}
        </tr>
      ))}{" "}
      {showFiltersRow
        ? headerGroups.map((headerGroup) => (
            <tr key={`${headerGroup.id}-filters`}>
              {" "}
              {headerGroup.headers.map((header) => (
                <th
                  key={`${header.id}-filter`}
                  className={cn(
                    GRID_CLASS.filterCell,
                    compact && "h-10 px-1.5 py-1",
                  )}
                >
                  {" "}
                  <DataGridFilterControl
                    header={header}
                    textValue={
                      textFilterInputs[header.column.id] ??
                      ((header.column.getFilterValue() ?? "") as string)
                    }
                    onTextValueChange={onTextFilterInputChange}
                  />{" "}
                </th>
              ))}{" "}
              {hasActions ? (
                <th className={cn(GRID_CLASS.filterCell, "ps-2 pe-2")} />
              ) : null}{" "}
            </tr>
          ))
        : null}{" "}
    </thead>
  );
}
export const DataGridHead = React.memo(DataGridHeadComponent);

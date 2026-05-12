"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "../../atoms/checkbox";
import { cn } from "../../../lib/utils";
import { XIcon } from "lucide-react";
import type { Table, Column } from "@tanstack/react-table";
import { DataTableColumnOrdering } from "./dataTableColumnOrdering";

// Helper function to get display name for columns
const getColumnDisplayName = <TData,>(
  column: Column<TData, unknown>
): string => {
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header;
  }
  return column.id;
};

interface DataTableSettingsProps<TData> {
  table: Table<TData>;
  showColumnVisibility?: boolean;
  showColumnOrdering?: boolean;
  showColumnPinning?: boolean;
  showColumnSizing?: boolean;
  className?: string;
  onClose?: () => void;
}

export function DataTableSettings<TData>({
  table,
  showColumnVisibility = true,
  showColumnOrdering = true,
  showColumnPinning = true,
  showColumnSizing = true,
  className,
  onClose,
}: DataTableSettingsProps<TData>) {
  const [activeTab, setActiveTab] = useState<
    "visibility" | "ordering" | "pinning" | "sizing"
  >("visibility");
  const columns = table.getAllColumns();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "border-border bg-card absolute inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-xl transition-transform duration-300 ease-in-out sm:w-80 md:w-96",
        className
      )}
    >
      {/* Header */}
      <div className="border-border bg-muted/60 flex items-center justify-between border-b p-3 sm:p-4">
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors"
            aria-label="Close settings"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-border bg-card flex overflow-x-auto border-b">
        {showColumnVisibility && (
          <button
            onClick={() => setActiveTab("visibility")}
            className={cn(
              "flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              activeTab === "visibility"
                ? "border-b-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="hidden sm:inline">Visibility</span>
            <span className="sm:hidden">View</span>
          </button>
        )}
        {showColumnOrdering && (
          <button
            onClick={() => setActiveTab("ordering")}
            className={cn(
              "flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              activeTab === "ordering"
                ? "border-b-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="hidden sm:inline">Order</span>
            <span className="sm:hidden">Sort</span>
          </button>
        )}
        {showColumnPinning && (
          <button
            onClick={() => setActiveTab("pinning")}
            className={cn(
              "flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              activeTab === "pinning"
                ? "border-b-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="hidden sm:inline">Pinning</span>
            <span className="sm:hidden">Pin</span>
          </button>
        )}
        {showColumnSizing && (
          <button
            onClick={() => setActiveTab("sizing")}
            className={cn(
              "flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              activeTab === "sizing"
                ? "border-b-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="hidden sm:inline">Sizing</span>
            <span className="sm:hidden">Size</span>
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "ordering" && showColumnOrdering && (
          <DataTableColumnOrdering table={table} />
        )}

        {activeTab === "visibility" && showColumnVisibility && (
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            <h3 className="text-foreground mb-2 text-xs font-medium sm:mb-3 sm:text-sm">
              Column Visibility
            </h3>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`visibility-${column.id}`}
                    label={getColumnDisplayName(column)}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(!!checked)
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pinning" && showColumnPinning && (
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            <h3 className="text-foreground mb-3 text-sm font-medium">
              Column Pinning
            </h3>
            <div className="text-muted-foreground mb-2 text-sm">
              Pin columns to left or right
            </div>
            <div className="space-y-2">
              {columns.filter(column => column.id !== 'select').map((column) => {
                const isPinned = column.getIsPinned();
                const pinStatus =
                  isPinned === "left"
                    ? "Pinned Left"
                    : isPinned === "right"
                    ? "Pinned Right"
                    : "Not Pinned";

                return (
                  <div
                    key={column.id}
                    className="bg-muted/60 flex items-center justify-between rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground truncate font-medium">
                        {getColumnDisplayName(column)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        ID: {column.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          isPinned === "left"
                            ? "bg-primary/15 text-primary"
                            : isPinned === "right"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {pinStatus}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => column.pin("left")}
                          className={`rounded px-2 py-1 text-xs transition-colors hover:bg-primary/20 ${
                            isPinned === "left"
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          Left
                        </button>
                        <button
                          onClick={() => column.pin("right")}
                          className={`rounded px-2 py-1 text-xs transition-colors hover:bg-primary/20 ${
                            isPinned === "right"
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          Right
                        </button>
                        <button
                          onClick={() => column.pin(false)}
                          className={`rounded px-2 py-1 text-xs transition-colors hover:bg-muted ${
                            !isPinned
                              ? "bg-muted-foreground text-background"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          Unpin
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "sizing" && showColumnSizing && (
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            <h3 className="text-foreground mb-3 text-sm font-medium">
              Column Sizing
            </h3>
            <div className="text-muted-foreground mb-2 text-sm">
              Adjust column widths
            </div>
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-foreground text-sm font-medium">
                      {getColumnDisplayName(column)}
                    </label>
                    <span className="text-muted-foreground text-xs">
                      {Math.round(column.getSize())}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={column.getSize()}
                    onChange={(e) =>
                      table.setColumnSizing((prev) => ({
                        ...prev,
                        [column.id]: Number(e.target.value),
                      }))
                    }
                    className="bg-muted h-2 w-full cursor-pointer appearance-none rounded-lg"
                    aria-label={`Adjust width for ${column.id} column`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

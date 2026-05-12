"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { flexRender } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import { Checkbox } from "../../atoms/checkbox";
import type { Table, Row, Cell } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { getDensityClasses, type RowDensity } from "./dataTableDensity.utils";

/** Row hover / selection tints (match admin `@theme` primary + card). */
const selectedRowBg = "color-mix(in oklab, var(--primary) 14%, var(--card))";
const selectedRowHoverBg = "color-mix(in oklab, var(--primary) 24%, var(--card))";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  className?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: Row<TData>) => string);
  cellClassName?: string | ((cell: Cell<TData, unknown>) => string);
  size?: "sm" | "md" | "lg";
  density?: RowDensity;
  onRowClick?: (row: Row<TData>) => void;
  onRowDoubleClick?: (row: Row<TData>) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: Row<TData>) => void;
    variant?: "default" | "destructive" | "outline";
    disabled?: (row: Row<TData>) => boolean;
  }>;
  showActions?: boolean;
  renderExpandedContent?: (row: TData) => React.ReactNode;
  statusConfig?: {
    field: keyof TData;
    colors: {
      [key: string]: {
        bg: string;
        text: string;
        border?: string;
      };
    };
  };
  columnStatusConfig?: {
    [columnId: string]: {
      field: keyof TData;
      colors: {
        [key: string]: {
          bg: string;
          text: string;
        };
      };
    };
  };
  columnWidths?: Record<string, number>;
}

export function DataTableBody<TData>({
  table,
  bodyClassName,
  rowClassName,
  cellClassName,
  size = "md",
  density = "normal",
  onRowClick,
  onRowDoubleClick,
  actions = [],
  showActions = false,
  renderExpandedContent,
  statusConfig,
  columnStatusConfig,
  columnWidths = {},
}: DataTableBodyProps<TData>) {
  // Helper function to get row status colors
  const getRowStatusColors = (row: Row<TData>) => {
    if (!statusConfig)
      return { bg: undefined, text: undefined, border: undefined };

    const statusValue = row.original[statusConfig.field];
    const statusKey = String(statusValue);
    const colors = statusConfig.colors[statusKey];

    return colors || { bg: undefined, text: undefined, border: undefined };
  };

  // Helper function to get column status colors
  const getColumnStatusColors = (cell: Cell<TData, unknown>) => {
    const config = columnStatusConfig?.[cell.column.id];
    if (!config) return { bg: undefined, text: undefined };

    const statusValue = cell.row.original[config.field];
    const statusKey = String(statusValue);
    const colors = config.colors[statusKey];

    return colors || { bg: undefined, text: undefined };
  };

  const densityClasses = useMemo(() => getDensityClasses(density), [density]);

  const rowClasses = useMemo(() => cn(
    "hover:bg-accent/50 transition-colors duration-200 cursor-pointer",
    densityClasses.row
  ), [densityClasses.row]);

  const bodyClasses = useMemo(() => cn(
    "divide-border bg-card divide-y",
    {
      "text-xs": size === "sm",
      "text-sm": size === "md",
      "text-base": size === "lg",
    },
    bodyClassName
  ), [size, bodyClassName]);

  const renderCell = (cell: Cell<TData, unknown>) => {
    // Special handling for select column
    if (cell.column.id === "select") {
      return (
        <td
          key={cell.id}
          className={cn(
            "hover:bg-accent/40 text-center transition-colors duration-200",
            "w-2",
            densityClasses.cell
          )}
          style={{
            width: "50px",
            minWidth: "50px",
          }}
        >
          <div className="flex items-center justify-center">
            <Checkbox
              id=""
              label=""
              checked={cell.row.getIsSelected()}
              onCheckedChange={(value) => cell.row.toggleSelected(!!value)}
              aria-label={`Select row`}
            />
          </div>
        </td>
      );
    }

    const columnColors = getColumnStatusColors(cell);
    const isPinned = cell.column.getIsPinned();

    // Get all visible columns to determine if this is the last pinned column
    const visibleColumns = table.getVisibleLeafColumns();
    const leftPinnedColumns = visibleColumns.filter((col) => col.getIsPinned() === "left");
    const rightPinnedColumns = visibleColumns.filter((col) => col.getIsPinned() === "right");
    const lastLeftPinned = leftPinnedColumns[leftPinnedColumns.length - 1];
    const firstRightPinned = rightPinnedColumns[0];

    const isLastPinnedLeft =
      isPinned === "left" && lastLeftPinned?.id === cell.column.id;
    const isLastPinnedRight =
      isPinned === "right" && firstRightPinned?.id === cell.column.id;

    return (
      <td
        key={cell.id}
        className={cn(
          "text-foreground min-w-0 whitespace-normal break-words align-top transition-colors duration-200 relative",
          densityClasses.cell,
          !columnColors.bg && "hover:bg-accent/40",
          typeof cellClassName === "function"
            ? cellClassName(cell)
            : cellClassName,
          // Pinned column styling - only last pinned column gets border
          {
            "border-r-2 border-r-primary/35": isLastPinnedLeft,
            "border-l-2 border-l-primary/35": isLastPinnedRight,
          }
        )}
        style={{
          backgroundColor: columnColors.bg || undefined,
          color: columnColors.text || undefined,
          width: `${columnWidths[cell.column.id] || cell.column.getSize()}px`,
          minWidth: "100px",
        }}
        onMouseEnter={(e) => {
          if (columnColors.bg) {
            // Create a slightly darker version for hover
            const rgb = columnColors.bg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const [rStr, gStr, bStr] = rgb;
              if (rStr == null || gStr == null || bStr == null) return;
              const r = Math.max(0, parseInt(rStr, 10) - 20);
              const g = Math.max(0, parseInt(gStr, 10) - 20);
              const b = Math.max(0, parseInt(bStr, 10) - 20);
              e.currentTarget.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
          } else {
            e.currentTarget.style.backgroundColor = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = columnColors.bg || "";
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </td>
    );
  };

  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpenPopover(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const updatePopoverPosition = (button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const popoverWidth = 192; // w-48 = 192px
    const viewportWidth = window.innerWidth;

    // Calculate left position, ensuring it doesn't go off screen
    let left = rect.right - popoverWidth;
    if (left < 0) {
      left = rect.left;
    }
    if (left + popoverWidth > viewportWidth) {
      left = viewportWidth - popoverWidth - 10; // 10px margin from edge
    }

    setPopoverPosition({
      top: rect.bottom + 4,
      left: left,
    });
  };

  const renderActions = (row: Row<TData>) => {
    if (!showActions || actions.length === 0) return null;

    const isOpen = openPopover === row.id;

    return (
      <td className="border-border text-foreground bg-card hover:bg-accent/40 sticky right-0 w-12 border-l px-1 py-3 transition-colors duration-200">
        <div className="relative flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const button = e.currentTarget;
              updatePopoverPosition(button);
              setOpenPopover(isOpen ? null : row.id);
            }}
            className="hover:bg-accent rounded p-1 transition-colors "
            title="Actions"
          >
            <MoreHorizontalIcon className="w-4 h-4" />
          </button>

          {isOpen &&
            createPortal(
              <div
                ref={popoverRef}
                className="border-border bg-popover text-popover-foreground fixed z-[9999] w-48 rounded-lg border shadow-xl"
                style={{
                  top: popoverPosition.top,
                  left: popoverPosition.left,
                }}
              >
                <div className="py-1">
                  {actions.map((action, index) => {
                    const isDisabled = action.disabled?.(row) || false;
                    const itemClasses = cn(
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer",
                      {
                        "text-foreground hover:bg-accent":
                          (!isDisabled && action.variant === "default") ||
                          !action.variant,
                        "text-destructive hover:bg-destructive/10":
                          !isDisabled && action.variant === "destructive",
                        "text-muted-foreground hover:bg-muted/80":
                          !isDisabled && action.variant === "outline",
                        "text-muted-foreground/60 cursor-not-allowed": isDisabled,
                      }
                    );

                    return (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) {
                            action.onClick(row);
                            setOpenPopover(null);
                          }
                        }}
                        className={itemClasses}
                      >
                        {action.icon && (
                          <span className="w-4 h-4">{action.icon}</span>
                        )}
                        <span>{action.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>,
              document.body
            )}
        </div>
      </td>
    );
  };

  const renderRow = (row: Row<TData>) => {
    const rowColors = getRowStatusColors(row);
    const isEven = row.index % 2 !== 0;

    return (
      <React.Fragment key={row.id}>
        <tr
          className={cn(
            rowClasses,
            typeof rowClassName === "function"
              ? rowClassName(row)
              : rowClassName,
            {
              "bg-primary/10": row.getIsSelected(),
              "cursor-pointer":
                onRowClick || onRowDoubleClick || row.getCanExpand(),
              "hover:bg-primary/15": !rowColors.bg && !row.getIsSelected(),
              "bg-muted/45": !rowColors.bg && !row.getIsSelected() && isEven,
              "bg-card": !rowColors.bg && !row.getIsSelected() && !isEven,
            }
          )}
          style={{
            backgroundColor: row.getIsSelected() ? selectedRowBg : rowColors.bg,
            color: rowColors.text,
            borderColor: rowColors.border,
          }}
          onMouseEnter={(e) => {
            if (row.getIsSelected()) {
              e.currentTarget.style.backgroundColor = selectedRowHoverBg;
            } else if (rowColors.bg) {
              // Create a slightly darker version for hover
              const rgb = rowColors.bg.match(/\d+/g);
              if (rgb && rgb.length >= 3) {
                const [rStr, gStr, bStr] = rgb;
                if (rStr == null || gStr == null || bStr == null) return;
                const r = Math.max(0, parseInt(rStr, 10) - 20);
                const g = Math.max(0, parseInt(gStr, 10) - 20);
                const b = Math.max(0, parseInt(bStr, 10) - 20);
                e.currentTarget.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
              }
            } else {
              e.currentTarget.style.backgroundColor = "var(--accent)";
            }
          }}
          onMouseLeave={(e) => {
            if (row.getIsSelected()) {
              e.currentTarget.style.backgroundColor = selectedRowBg;
            } else {
              e.currentTarget.style.backgroundColor = rowColors.bg || "";
            }
          }}
          onClick={() => {
            if (row.getCanExpand()) {
              row.toggleExpanded();
            }
            onRowClick?.(row);
          }}
          onDoubleClick={() => onRowDoubleClick?.(row)}
        >
          {row.getVisibleCells().map((cell) => renderCell(cell))}
          {renderActions(row)}
        </tr>
        {row.getIsExpanded() && (
          <tr key={`${row.id}-expanded`} className="bg-muted/60">
            <td
              colSpan={row.getVisibleCells().length + (showActions ? 1 : 0)}
              className="px-0 py-0"
            >
              {renderExpandedContent ? (
                renderExpandedContent(row.original)
              ) : (
                <div className="border-border bg-card text-card-foreground m-4 rounded-lg border p-4 shadow-sm">
                  <div className="text-muted-foreground mb-2 text-sm">
                    Expanded Details:
                  </div>
                  <div className="space-y-2">
                    {Object.entries(row.original as Record<string, unknown>).map(
                      ([key, value]) => (
                        <div key={key} className="flex">
                          <span className="text-foreground w-32 font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="text-foreground">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <tbody className={bodyClasses}>
      {table.getRowModel().rows.map((row) => renderRow(row))}
    </tbody>
  );
}

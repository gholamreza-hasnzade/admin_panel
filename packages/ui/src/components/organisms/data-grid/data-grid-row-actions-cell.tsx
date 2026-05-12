"use client";
import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button";
import { GRID_CLASS } from "./data-grid.constants";
import type { DataGridRowAction } from "./data-grid.types";
type DataGridRowActionsCellProps<TData> = {
  row: Row<TData>;
  rowActionsMode: "inline" | "toggle";
  rowActions?: DataGridRowAction<TData>[];
  rowActionsToggleLabel?: React.ReactNode;
  rowActionsToggleIcon?: React.ReactNode;
  rowActionsPanelClassName?: string;
  openActionRowId: string | null;
  setOpenActionRowId: React.Dispatch<React.SetStateAction<string | null>>;
  actionRootRef: React.RefObject<HTMLDivElement | null>;
  hasToggleLabel: boolean;
};
function DataGridRowActionsCellComponent<TData>({
  row,
  rowActionsMode,
  rowActions,
  rowActionsToggleLabel,
  rowActionsToggleIcon,
  rowActionsPanelClassName,
  openActionRowId,
  setOpenActionRowId,
  actionRootRef,
  hasToggleLabel,
}: DataGridRowActionsCellProps<TData>) {
  return (
    <td className={cn(GRID_CLASS.bodyCell, "text-left")}>
      {rowActionsMode === "toggle" ? (
        <div
          className="relative inline-flex"
          ref={openActionRowId === row.id ? actionRootRef : null}
        >
          <Button
            variant={hasToggleLabel ? "outline" : "ghost"}
            size={hasToggleLabel ? "sm" : "icon"}
            icon={hasToggleLabel ? undefined : rowActionsToggleIcon}
            iconRight={hasToggleLabel ? rowActionsToggleIcon : undefined}
            aria-label={hasToggleLabel ? undefined : "عملیات"}
            className={cn(
              !hasToggleLabel &&
                "size-8 rounded-md border border-transparent bg-transparent hover:bg-accent/60",
            )}
            onClick={() =>
              setOpenActionRowId((prev) => (prev === row.id ? null : row.id))
            }
          >
            {hasToggleLabel ? rowActionsToggleLabel : null}
          </Button>
          {openActionRowId === row.id ? (
            <div
              className={cn(
                "absolute inset-e-0 top-full z-20 mt-1 min-w-40 rounded-md border border-border bg-popover p-1 shadow-md",
                rowActionsPanelClassName,
              )}
            >
              <div className="flex flex-col gap-1">
                {rowActions?.map((action, index) => {
                  if (action.visible && !action.visible(row.original))
                    return null;
                  const disabled =
                    typeof action.disabled === "function"
                      ? action.disabled(row.original)
                      : Boolean(action.disabled);
                  return (
                    <Button
                      key={`row-action-toggle-${index}`}
                      variant={action.variant ?? "ghost"}
                      size={action.size ?? "sm"}
                      iconRight={action.icon}
                      onClick={() => {
                        action.onClick(row.original);
                        setOpenActionRowId(null);
                      }}
                      disabled={disabled}
                      className={cn("justify-start", action.className)}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {rowActions?.map((action, index) => {
            if (action.visible && !action.visible(row.original)) return null;
            const disabled =
              typeof action.disabled === "function"
                ? action.disabled(row.original)
                : Boolean(action.disabled);
            return (
              <Button
                key={`row-action-${index}`}
                variant={action.variant ?? "outline"}
                size={action.size ?? "sm"}
                iconRight={action.icon}
                onClick={() => action.onClick(row.original)}
                disabled={disabled}
                className={action.className}
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </td>
  );
}
export const DataGridRowActionsCell = React.memo(
  DataGridRowActionsCellComponent,
) as typeof DataGridRowActionsCellComponent;

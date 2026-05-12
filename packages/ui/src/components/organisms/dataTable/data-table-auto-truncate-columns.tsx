import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { DataTableTruncatedCell } from "./dataTableTruncatedCell";

export type DataTableAutoTruncateMeta = {
  /**
   * When `false`, this column is left unchanged (no auto truncate+tooltip).
   * Default: columns with only `accessorKey` / `accessorFn` and no `cell` get auto truncate.
   */
  truncateTooltip?: boolean;
};

function getMeta(col: ColumnDef<unknown, unknown>): DataTableAutoTruncateMeta | undefined {
  const m = col.meta;
  if (m && typeof m === "object") return m as DataTableAutoTruncateMeta;
  return undefined;
}

/**
 * Injects `DataTableTruncatedCell` for accessor-only columns when `enabled`.
 * Columns that already define `cell` are unchanged.
 */
export function applyAutoTruncateTextCells<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  enabled: boolean,
): ColumnDef<TData, TValue>[] {
  if (!enabled) return columns;

  return columns.map((col) => {
    const meta = getMeta(col as ColumnDef<unknown, unknown>);
    if (meta?.truncateTooltip === false) return col;

    const id = "id" in col && typeof col.id === "string" ? col.id : undefined;
    if (id === "select") return col;

    const hasAccessorKey =
      "accessorKey" in col &&
      typeof (col as { accessorKey?: unknown }).accessorKey === "string" &&
      String((col as { accessorKey: string }).accessorKey).length > 0;
    const hasAccessorFn =
      "accessorFn" in col &&
      typeof (col as { accessorFn?: unknown }).accessorFn === "function";

    if (!hasAccessorKey && !hasAccessorFn) return col;

    const existingCell = "cell" in col ? col.cell : undefined;
    if (existingCell != null) return col;

    return {
      ...col,
      cell: (info: CellContext<TData, TValue>) => (
        <DataTableTruncatedCell
          value={info.getValue() as string | number | null | undefined}
        />
      ),
    };
  });
}

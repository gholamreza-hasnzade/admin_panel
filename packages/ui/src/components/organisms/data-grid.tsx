"use client";

import * as React from "react";
import type { AxiosInstance } from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "../../lib/utils";
import { TableEmptyIcon } from "../../icons";
import { Button, type ButtonProps } from "../atoms/button";
import { TextField } from "../atoms/text-field";
import { Pagination } from "../molecules/pagination";

type FilterType = "text" | "select" | "checkbox" | "date";

type FilterOption = {
  label: string;
  value: string;
};

export type DataGridColumnMeta = {
  title?: string;
  sortable?: boolean;
  filterType?: FilterType;
  filterOptions?: FilterOption[];
};

export type DataGridColumnDef<TData> = ColumnDef<TData> & {
  meta?: DataGridColumnMeta;
};

export type DataGridRowAction<TData> = {
  label: React.ReactNode;
  onClick: (row: TData) => void;
  icon?: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: Exclude<ButtonProps["size"], "icon">;
  className?: string;
  disabled?: boolean | ((row: TData) => boolean);
  visible?: (row: TData) => boolean;
};

export type DataGridProps<TData> = {
  url: string;
  apiClient?: AxiosInstance;
  columns: DataGridColumnDef<TData>[];
  className?: string;
  tableWrapperClassName?: string;
  dataPath?: string;
  totalPath?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  mapData?: (raw: unknown) => TData[];
  emptyMessage?: string;
  pageParamName?: string;
  limitParamName?: string;
  skipParamName?: string | false;
  sortByParamName?: string;
  sortOrderParamName?: string;
  filterParamPrefix?: string;
  maxBodyHeightClassName?: string;
  rowActions?: DataGridRowAction<TData>[];
  actionsHeader?: React.ReactNode;
  rowActionsMode?: "inline" | "toggle";
  rowActionsToggleLabel?: React.ReactNode;
  rowActionsToggleIcon?: React.ReactNode;
  rowActionsPanelClassName?: string;
  showGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;
  globalSearchParamName?: string;
  filterDebounceMs?: number;
};

function getByPath(obj: unknown, path: string) {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function toStringSafe(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

const GRID_CLASS = {
  shell: "w-full space-y-4 rounded-xl border border-border/90 bg-card p-3 shadow-sm md:p-4",
  wrapper: "overflow-hidden rounded-lg border border-border/80 bg-background",
  table: "w-full min-w-[920px] table-fixed border-collapse text-sm",
  headerCell:
    "sticky top-0 z-20 h-11 border-b border-border/90 bg-muted px-4 text-right text-xs font-semibold text-foreground md:text-sm",
  filterCell: "sticky top-11 z-10 h-11 border-b border-border/80 bg-card px-2.5 py-1.5 text-right",
  bodyCell: "border-b border-border/60 px-4 py-2.5 text-right align-middle text-xs text-foreground md:text-sm",
  filterControl:
    "h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring",
} as const;

function DataGrid<TData>({
  url,
  apiClient,
  columns,
  className,
  tableWrapperClassName,
  dataPath = "data",
  totalPath = "total",
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  queryParams,
  mapData,
  emptyMessage = "داده‌ای برای نمایش وجود ندارد.",
  pageParamName = "pageNumber",
  limitParamName = "pageSize",
  skipParamName = false,
  sortByParamName = "sortBy",
  sortOrderParamName = "order",
  filterParamPrefix = "filter.",
  maxBodyHeightClassName = "h-[62dvh]",
  rowActions,
  actionsHeader = "عملیات",
  rowActionsMode = "inline",
  rowActionsToggleLabel = "عملیات",
  rowActionsToggleIcon,
  rowActionsPanelClassName,
  showGlobalSearch = false,
  globalSearchPlaceholder = "جستجو در همه ستون‌ها...",
  globalSearchParamName = "search",
  filterDebounceMs = 400,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [textFilterInputs, setTextFilterInputs] = React.useState<Record<string, string>>({});
  const [globalSearchInput, setGlobalSearchInput] = React.useState("");
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const textFilterColumnIds = React.useMemo(() => {
    return columns
      .filter((column) => column.meta?.filterType === "text")
      .map((column) => ("accessorKey" in column ? String(column.accessorKey ?? "") : String(column.id ?? "")))
      .filter(Boolean);
  }, [columns]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearchInput.trim());
    }, filterDebounceMs);
    return () => clearTimeout(timer);
  }, [globalSearchInput, filterDebounceMs]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setColumnFilters((prev) => {
        const nonTextFilters = prev.filter((filter) => !textFilterColumnIds.includes(filter.id));
        const nextTextFilters = Object.entries(textFilterInputs)
          .map(([id, value]) => ({ id, value: value.trim() }))
          .filter((item) => item.value !== "");
        return [...nonTextFilters, ...nextTextFilters];
      });
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, filterDebounceMs);
    return () => clearTimeout(timer);
  }, [textFilterInputs, textFilterColumnIds, filterDebounceMs]);

  const requestParams = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set(pageParamName, String(pagination.pageIndex + 1));
    params.set(limitParamName, String(pagination.pageSize));
    if (skipParamName) {
      params.set(skipParamName, String(pagination.pageIndex * pagination.pageSize));
    }

    const sort = sorting[0];
    if (sort) {
      params.set(sortByParamName, sort.id);
      params.set(sortOrderParamName, sort.desc ? "desc" : "asc");
    }

    columnFilters.forEach((filter) => {
      const value = filter.value;
      if (value !== "" && value !== undefined && value !== null) {
        params.set(`${filterParamPrefix}${filter.id}`, String(value));
      }
    });

    if (debouncedGlobalSearch) {
      params.set(globalSearchParamName, debouncedGlobalSearch);
    }

    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });

    return params;
  }, [
    pageParamName,
    limitParamName,
    skipParamName,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    filterParamPrefix,
    debouncedGlobalSearch,
    globalSearchParamName,
    queryParams,
    sortByParamName,
    sortOrderParamName,
  ]);

  const queryResult = useQuery({
    queryKey: ["data-grid", url, requestParams.toString(), dataPath, totalPath],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const raw: unknown = apiClient
        ? (
            await apiClient.get(url, {
              params: Object.fromEntries(requestParams.entries()),
            })
          ).data
        : await (async () => {
            const parsedUrl = new URL(
              url,
              typeof window !== "undefined" ? window.location.origin : "http://localhost",
            );
            requestParams.forEach((value, key) => parsedUrl.searchParams.set(key, value));
            const response = await fetch(parsedUrl.toString());
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return response.json() as Promise<unknown>;
          })();

      const mapped = mapData
        ? mapData(raw)
        : ((getByPath(raw, dataPath) ?? raw) as TData[] | undefined) ?? [];
      if (!Array.isArray(mapped)) {
        throw new Error("Mapped response is not an array.");
      }

      const total = Number(getByPath(raw, totalPath) ?? mapped.length);
      return {
        data: mapped,
        totalRows: Number.isFinite(total) ? total : mapped.length,
      };
    },
  });

  const enhancedColumns = React.useMemo<DataGridColumnDef<TData>[]>(() => {
    return columns.map((column) => {
      const meta = column.meta;
      const sortable = meta?.sortable ?? column.enableSorting ?? false;
      const filterType = meta?.filterType;

      const next: DataGridColumnDef<TData> = {
        ...column,
        enableSorting: sortable,
      };

      if (filterType === "date") {
        next.filterFn = (row, columnId, value) => {
          const rowValue = row.getValue(columnId);
          if (!value) return true;
          if (!rowValue) return false;
          const normalized = String(rowValue).slice(0, 10);
          return normalized === String(value);
        };
      } else if (filterType === "checkbox") {
        next.filterFn = (row, columnId, value) => {
          if (value === "" || value === undefined) return true;
          return String(row.getValue(columnId)) === String(value);
        };
      } else if (filterType === "select") {
        next.filterFn = (row, columnId, value) => {
          if (!value) return true;
          return toStringSafe(row.getValue(columnId)) === String(value);
        };
      }

      return next;
    });
  }, [columns]);

  const data = queryResult.data?.data ?? [];
  const totalRows = queryResult.data?.totalRows ?? 0;
  const loading = queryResult.isPending || (queryResult.isFetching && data.length === 0);
  const error = queryResult.isError
    ? queryResult.error instanceof Error
      ? queryResult.error.message
      : "خطا در دریافت اطلاعات"
    : null;

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: totalRows,
  });

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize));
  const currentPage = pagination.pageIndex + 1;
  const hasActions = Boolean(rowActions?.length);
  const [openActionRowId, setOpenActionRowId] = React.useState<string | null>(null);
  const visibleRows = table.getRowModel().rows;
  const actionRootRef = React.useRef<HTMLDivElement | null>(null);
  const hasToggleLabel =
    rowActionsToggleLabel !== null &&
    rowActionsToggleLabel !== undefined &&
    rowActionsToggleLabel !== false &&
    (!(typeof rowActionsToggleLabel === "string") || rowActionsToggleLabel.trim().length > 0);

  React.useEffect(() => {
    if (!openActionRowId) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (actionRootRef.current && target && !actionRootRef.current.contains(target)) {
        setOpenActionRowId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenActionRowId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openActionRowId]);

  const renderFilterControl = React.useCallback(
    (header: {
      isPlaceholder: boolean;
      column: {
        id: string;
        columnDef: { meta?: DataGridColumnMeta };
        getFilterValue: () => unknown;
        setFilterValue: (value: unknown) => void;
      };
    }) => {
      const meta = (header.column.columnDef.meta ?? {}) as DataGridColumnMeta;
      const filterType = meta.filterType;
      const column = header.column;
      const value = (column.getFilterValue() ?? "") as string;

      if (!filterType || header.isPlaceholder) return null;

      if (filterType === "select") {
        return (
          <select
            value={value}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={GRID_CLASS.filterControl}
            aria-label={`Filter ${column.id}`}
          >
            <option value="">همه</option>
            {meta.filterOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (filterType === "checkbox") {
        return (
          <select
            value={value}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={GRID_CLASS.filterControl}
            aria-label={`Filter ${column.id}`}
          >
            <option value="">همه</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        );
      }

      if (filterType === "date") {
        return (
          <input
            type="date"
            value={value}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={GRID_CLASS.filterControl}
            aria-label={`Filter ${column.id}`}
          />
        );
      }

      return (
        <TextField
          value={textFilterInputs[column.id] ?? value}
          onChange={(event) =>
            setTextFilterInputs((prev) => ({
              ...prev,
              [column.id]: event.target.value,
            }))
          }
          placeholder="جستجو..."
          size="sm"
          className="w-full"
          containerClassName="h-8"
          inputClassName="text-xs"
        />
      );
    },
    [textFilterInputs],
  );

  return (
    <div
      className={cn(
        GRID_CLASS.shell,
        className,
      )}
    >
      {showGlobalSearch ? (
        <div className="max-w-md">
          <TextField
            value={globalSearchInput}
            onChange={(event) => setGlobalSearchInput(event.target.value)}
            placeholder={globalSearchPlaceholder}
            size="sm"
            containerClassName="h-9"
            inputClassName="bg-background"
          />
        </div>
      ) : null}

      <div
        className={cn(
          GRID_CLASS.wrapper,
          maxBodyHeightClassName,
          tableWrapperClassName,
        )}
      >
        <div className="h-full overflow-x-auto overflow-y-auto">
          <table className={GRID_CLASS.table}>
          <thead className="bg-muted/55">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        GRID_CLASS.headerCell,
                        canSort && "group",
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex w-full items-center justify-between gap-2 text-right transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="truncate">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] text-muted-foreground/70 transition-opacity",
                              sortState ? "opacity-100" : "opacity-50 group-hover:opacity-80",
                            )}
                            aria-hidden
                          >
                            {sortState === "asc" ? "▲" : sortState === "desc" ? "▼" : "⇅"}
                          </span>
                        </button>
                      ) : (
                        <span className="truncate">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </th>
                  );
                })}
                {hasActions ? (
                  <th className={cn(GRID_CLASS.headerCell, "ps-2 pe-2 text-left")}>
                    {actionsHeader}
                  </th>
                ) : null}
              </tr>
            ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={`${headerGroup.id}-filters`}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={`${header.id}-filter`} className={GRID_CLASS.filterCell}>
                      {renderFilterControl(header)}
                    </th>
                  );
                })}
                {hasActions ? <th className={cn(GRID_CLASS.filterCell, "ps-2 pe-2")} /> : null}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-border/60">
                  {table.getAllLeafColumns().map((column) => (
                    <td key={`${column.id}-${index}`} className={GRID_CLASS.bodyCell}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                  {hasActions ? (
                    <td className={GRID_CLASS.bodyCell}>
                      <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ) : null}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={table.getAllLeafColumns().length + (hasActions ? 1 : 0)} className="px-3 py-6 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length + (hasActions ? 1 : 0)}
                  className="px-3 py-10 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="rounded-full border border-border/70 bg-muted/35 p-2.5">
                      <TableEmptyIcon />
                    </div>
                    <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                    <p className="text-xs text-muted-foreground">برای شروع می‌توانید یک آیتم جدید ایجاد کنید.</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 odd:bg-card even:bg-muted/20 hover:bg-accent/40">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn(GRID_CLASS.bodyCell, "truncate")}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    {hasActions ? (
                      <td className={cn(GRID_CLASS.bodyCell, "text-left")}>
                        {rowActionsMode === "toggle" ? (
                          <div className="relative inline-flex" ref={openActionRowId === row.id ? actionRootRef : null}>
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
                                    if (action.visible && !action.visible(row.original)) return null;
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
                                typeof action.disabled === "function" ? action.disabled(row.original) : Boolean(action.disabled);
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
                    ) : null}
                  </tr>
                ))}
              </>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">تعداد در صفحه:</span>
          <select
            aria-label="Rows per page"
            value={pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              setTextFilterInputs({});
              setGlobalSearchInput("");
            }}
          >
            پاک کردن فیلترها
          </Button>
          <span className="text-xs text-muted-foreground">
            {totalRows > 0 ? `${totalRows} رکورد` : ""}
          </span>
        </div>

        <Pagination
          page={currentPage}
          totalPages={Math.max(1, pageCount)}
          onPageChange={(nextPage) => table.setPageIndex(nextPage - 1)}
        />
      </div>
    </div>
  );
}

export { DataGrid };

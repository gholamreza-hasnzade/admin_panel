"use client";

import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "../../../lib/utils";
import { TableEmptyIcon } from "../../../icons";
import { Button } from "../../atoms/button";
import { TextField } from "../../atoms/text-field";
import { Pagination } from "../../molecules/pagination";
import { GRID_CLASS } from "./data-grid.constants";
import {
  areColumnFiltersEqual,
  buildEnhancedColumns,
  buildRequestParams,
  fetchGridData,
  toGridErrorMessage,
} from "./data-grid.helpers";
import type {
  DataGridColumnDef,
  DataGridColumnMeta,
  DataGridProps,
} from "./data-grid.types";

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
        const next = [...nonTextFilters, ...nextTextFilters];
        if (areColumnFiltersEqual(prev, next)) {
          return prev;
        }
        if (pagination.pageIndex !== 0) {
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }
        return next;
      });
    }, filterDebounceMs);
    return () => clearTimeout(timer);
  }, [textFilterInputs, textFilterColumnIds, filterDebounceMs, pagination.pageIndex]);

  const requestParams = React.useMemo(() => {
    return buildRequestParams({
      pageParamName,
      limitParamName,
      skipParamName,
      pagination,
      sorting,
      columnFilters,
      filterParamPrefix,
      debouncedGlobalSearch,
      globalSearchParamName,
      queryParams,
      sortByParamName,
      sortOrderParamName,
    });
  }, [
    pageParamName,
    limitParamName,
    skipParamName,
    pagination,
    sorting,
    columnFilters,
    filterParamPrefix,
    debouncedGlobalSearch,
    globalSearchParamName,
    queryParams,
    sortByParamName,
    sortOrderParamName,
  ]);

  const requestParamsObject = React.useMemo(
    () => Object.fromEntries(requestParams.entries()),
    [requestParams],
  );

  const queryResult = useQuery({
    queryKey: ["data-grid", url, requestParams.toString(), dataPath, totalPath],
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchGridData<TData>({
        apiClient,
        url,
        requestParamsObject,
        mapData,
        dataPath,
        totalPath,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const enhancedColumns = React.useMemo<DataGridColumnDef<TData>[]>(
    () => buildEnhancedColumns(columns),
    [columns],
  );

  const data = queryResult.data?.data ?? [];
  const totalRows = queryResult.data?.totalRows ?? 0;
  const loading = queryResult.isPending || (queryResult.isFetching && data.length === 0);
  const error = queryResult.isError ? toGridErrorMessage(queryResult.error) : null;

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
  const headerGroups = table.getHeaderGroups();
  const leafColumns = table.getAllLeafColumns();
  const visibleRows = table.getRowModel().rows;
  const colSpan = leafColumns.length + (hasActions ? 1 : 0);
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

  const clearFilters = React.useCallback(() => {
    table.resetColumnFilters();
    setTextFilterInputs({});
    setGlobalSearchInput("");
  }, [table]);

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
            {headerGroups.map((headerGroup) => (
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
            {headerGroups.map((headerGroup) => (
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
                  {leafColumns.map((column) => (
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
                <td colSpan={colSpan} className="px-3 py-6 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
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
            onClick={clearFilters}
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

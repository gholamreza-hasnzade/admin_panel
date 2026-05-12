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
import { DataGridHead } from "./data-grid-head";
import {
  areColumnFiltersEqual,
  buildEnhancedColumns,
  buildRequestParams,
  fetchGridData,
  toGridErrorMessage,
} from "./data-grid.helpers";
import { DataGridRowActionsCell } from "./data-grid-row-actions-cell";
import type { DataGridColumnDef, DataGridProps } from "./data-grid.types";
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
  enableRowVirtualization = true,
  rowVirtualizationEstimateHeight = 44,
  rowVirtualizationOverscan = 6,
  mobileMode = "auto",
  mobileBreakpoint = 768,
  mobilePageSize = 8,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [textFilterInputs, setTextFilterInputs] = React.useState<
    Record<string, string>
  >({});
  const [globalSearchInput, setGlobalSearchInput] = React.useState("");
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  React.useEffect(() => {
    if (mobileMode !== "auto" || typeof window === "undefined") return;
    const media = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const sync = () => setIsMobileViewport(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mobileMode, mobileBreakpoint]);
  const isMobileMode =
    mobileMode === "on" || (mobileMode === "auto" && isMobileViewport);
  const effectiveRowActionsMode = isMobileMode ? "toggle" : rowActionsMode;
  const showFiltersRow = !isMobileMode || showMobileFilters;
  React.useEffect(() => {
    if (!isMobileMode) return;
    setPagination((prev) => {
      if (prev.pageSize === mobilePageSize) return prev;
      return { pageIndex: 0, pageSize: mobilePageSize };
    });
  }, [isMobileMode, mobilePageSize]);
  const textFilterColumnIds = React.useMemo(() => {
    return columns
      .filter((column) => column.meta?.filterType === "text")
      .map((column) =>
        "accessorKey" in column
          ? String(column.accessorKey ?? "")
          : String(column.id ?? ""),
      )
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
        const nonTextFilters = prev.filter(
          (filter) => !textFilterColumnIds.includes(filter.id),
        );
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
  }, [
    textFilterInputs,
    textFilterColumnIds,
    filterDebounceMs,
    pagination.pageIndex,
  ]);
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
  const requestParamsKey = React.useMemo(
    () => requestParams.toString(),
    [requestParams],
  );
  const queryResult = useQuery({
    queryKey: ["data-grid", url, requestParamsKey, dataPath, totalPath],
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
  const loading =
    queryResult.isPending || (queryResult.isFetching && data.length === 0);
  const error = queryResult.isError
    ? toGridErrorMessage(queryResult.error)
    : null;
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: { sorting, columnFilters, pagination },
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
  const [openActionRowId, setOpenActionRowId] = React.useState<string | null>(
    null,
  );
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const headerGroups = table.getHeaderGroups();
  const leafColumns = table.getAllLeafColumns();
  const visibleRows = table.getRowModel().rows;
  const colSpan = leafColumns.length + (hasActions ? 1 : 0);
  const actionRootRef = React.useRef<HTMLDivElement | null>(null);
  const hasToggleLabel =
    rowActionsToggleLabel !== null &&
    rowActionsToggleLabel !== undefined &&
    rowActionsToggleLabel !== false &&
    (!(typeof rowActionsToggleLabel === "string") ||
      rowActionsToggleLabel.trim().length > 0);
  const handleBodyScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    },
    [],
  );
  const virtualizationRowHeight = Math.max(
    32,
    Math.round(rowVirtualizationEstimateHeight),
  );
  const virtualizationOverscan = Math.max(0, rowVirtualizationOverscan);
  const viewportHeight =
    scrollContainerRef.current?.clientHeight ??
    pagination.pageSize * virtualizationRowHeight;
  const canVirtualizeRows =
    enableRowVirtualization && !loading && !error && visibleRows.length > 0;
  const virtualStartIndex = canVirtualizeRows
    ? Math.max(
        0,
        Math.floor(scrollTop / virtualizationRowHeight) -
          virtualizationOverscan,
      )
    : 0;
  const virtualEndIndex = canVirtualizeRows
    ? Math.min(
        visibleRows.length,
        Math.ceil((scrollTop + viewportHeight) / virtualizationRowHeight) +
          virtualizationOverscan,
      )
    : visibleRows.length;
  const renderedRows = canVirtualizeRows
    ? visibleRows.slice(virtualStartIndex, virtualEndIndex)
    : visibleRows;
  const topVirtualPadding = canVirtualizeRows
    ? virtualStartIndex * virtualizationRowHeight
    : 0;
  const bottomVirtualPadding = canVirtualizeRows
    ? Math.max(
        0,
        (visibleRows.length - virtualEndIndex) * virtualizationRowHeight,
      )
    : 0;
  React.useEffect(() => {
    if (!openActionRowId) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        actionRootRef.current &&
        target &&
        !actionRootRef.current.contains(target)
      ) {
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
  React.useEffect(() => {
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pagination.pageIndex, pagination.pageSize, requestParamsKey]);
  const handleTextFilterInputChange = React.useCallback(
    (columnId: string, value: string) => {
      setTextFilterInputs((prev) => ({ ...prev, [columnId]: value }));
    },
    [],
  );
  const clearFilters = React.useCallback(() => {
    table.resetColumnFilters();
    setTextFilterInputs({});
    setGlobalSearchInput("");
  }, [table]);
  const tableBodyContent = React.useMemo(() => {
    if (loading) {
      return Array.from({ length: pagination.pageSize }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-border/60">
          {" "}
          {leafColumns.map((column) => (
            <td key={`${column.id}-${index}`} className={GRID_CLASS.bodyCell}>
              {" "}
              <div className="h-4 w-full animate-pulse rounded bg-muted" />{" "}
            </td>
          ))}{" "}
          {hasActions ? (
            <td className={GRID_CLASS.bodyCell}>
              {" "}
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />{" "}
            </td>
          ) : null}{" "}
        </tr>
      ));
    }
    if (error) {
      return (
        <tr>
          {" "}
          <td
            colSpan={colSpan}
            className="px-3 py-6 text-center text-destructive"
          >
            {" "}
            {error}{" "}
          </td>{" "}
        </tr>
      );
    }
    if (visibleRows.length === 0) {
      return (
        <tr>
          {" "}
          <td colSpan={colSpan} className="px-3 py-10 text-center">
            {" "}
            <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-muted-foreground">
              {" "}
              <div className="rounded-full border border-border/70 bg-muted/35 p-2.5">
                {" "}
                <TableEmptyIcon />{" "}
              </div>{" "}
              <p className="text-sm font-medium text-foreground">
                {emptyMessage}
              </p>{" "}
              <p className="text-xs text-muted-foreground">
                برای شروع می‌توانید یک آیتم جدید ایجاد کنید.
              </p>{" "}
            </div>{" "}
          </td>{" "}
        </tr>
      );
    }
    return (
      <>
        {" "}
        {topVirtualPadding > 0 ? (
          <tr aria-hidden>
            {" "}
            <td
              colSpan={colSpan}
              height={topVirtualPadding}
              className="border-0 p-0"
            />{" "}
          </tr>
        ) : null}{" "}
        {renderedRows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-border/60 odd:bg-card even:bg-muted/20 hover:bg-accent/40"
          >
            {" "}
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={cn(GRID_CLASS.bodyCell, "truncate")}>
                {" "}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}{" "}
              </td>
            ))}{" "}
            {hasActions ? (
              <DataGridRowActionsCell
                row={row}
                rowActionsMode={effectiveRowActionsMode}
                rowActions={rowActions}
                rowActionsToggleLabel={rowActionsToggleLabel}
                rowActionsToggleIcon={rowActionsToggleIcon}
                rowActionsPanelClassName={rowActionsPanelClassName}
                openActionRowId={openActionRowId}
                setOpenActionRowId={setOpenActionRowId}
                actionRootRef={actionRootRef}
                hasToggleLabel={hasToggleLabel}
              />
            ) : null}{" "}
          </tr>
        ))}{" "}
        {bottomVirtualPadding > 0 ? (
          <tr aria-hidden>
            {" "}
            <td
              colSpan={colSpan}
              height={bottomVirtualPadding}
              className="border-0 p-0"
            />{" "}
          </tr>
        ) : null}{" "}
      </>
    );
  }, [
    loading,
    pagination.pageSize,
    leafColumns,
    hasActions,
    error,
    colSpan,
    visibleRows.length,
    emptyMessage,
    topVirtualPadding,
    renderedRows,
    bottomVirtualPadding,
    rowActionsMode,
    effectiveRowActionsMode,
    openActionRowId,
    hasToggleLabel,
    rowActionsToggleIcon,
    rowActionsToggleLabel,
    rowActionsPanelClassName,
    rowActions,
  ]);
  return (
    <div className={cn(GRID_CLASS.shell, className)}>
      {" "}
      {showGlobalSearch ? (
        <div className={cn("max-w-md", isMobileMode && "max-w-full")}>
          {" "}
          <TextField
            value={globalSearchInput}
            onChange={(event) => setGlobalSearchInput(event.target.value)}
            placeholder={globalSearchPlaceholder}
            size="sm"
            containerClassName="h-9"
            inputClassName="bg-background"
          />{" "}
        </div>
      ) : null}{" "}
      {isMobileMode ? (
        <div className="flex items-center justify-end">
          {" "}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            {" "}
            {showMobileFilters ? "بستن فیلترها" : "نمایش فیلترها"}{" "}
          </Button>{" "}
        </div>
      ) : null}{" "}
      <div
        className={cn(
          GRID_CLASS.wrapper,
          maxBodyHeightClassName,
          tableWrapperClassName,
        )}
      >
        {" "}
        <div
          ref={scrollContainerRef}
          onScroll={handleBodyScroll}
          className="h-full overflow-x-auto overflow-y-auto"
        >
          {" "}
          <table
            className={cn(
              GRID_CLASS.table,
              isMobileMode && "min-w-[680px] text-xs",
            )}
          >
            {" "}
            <DataGridHead
              headerGroups={headerGroups}
              hasActions={hasActions}
              actionsHeader={actionsHeader}
              textFilterInputs={textFilterInputs}
              onTextFilterInputChange={handleTextFilterInputChange}
              compact={isMobileMode}
              showFiltersRow={showFiltersRow}
            />{" "}
            <tbody>{tableBodyContent}</tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex flex-col gap-3 border-t border-border/70 pt-3 md:flex-row md:items-center md:justify-between">
        {" "}
        <div className="flex flex-wrap items-center gap-2">
          {" "}
          <span className="text-xs text-muted-foreground">
            تعداد در صفحه:
          </span>{" "}
          <select
            aria-label="Rows per page"
            value={pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {" "}
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {" "}
                {option}{" "}
              </option>
            ))}{" "}
          </select>{" "}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            {" "}
            پاک کردن فیلترها{" "}
          </Button>{" "}
          <span className="text-xs text-muted-foreground">
            {" "}
            {totalRows > 0 ? `${totalRows} رکورد` : ""}{" "}
          </span>{" "}
        </div>{" "}
        <Pagination
          page={currentPage}
          totalPages={Math.max(1, pageCount)}
          onPageChange={(nextPage) => table.setPageIndex(nextPage - 1)}
        />{" "}
      </div>{" "}
    </div>
  );
}
export { DataGrid };

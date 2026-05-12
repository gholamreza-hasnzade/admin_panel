"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type GroupingState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnOrderState,
  type Table,
  type Row,
  type Cell,
} from "@tanstack/react-table";
import type { AxiosInstance } from "axios";
import { Checkbox } from "../../atoms/checkbox";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DataTableToolbar } from "./dataTableToolbar";
import { DataTablePagination } from "./dataTablePagination";
import { DataTableSettings } from "./dataTableSettings";
import { DataTableHeader } from "./dataTableHeader";
import { DataTableBody } from "./dataTableBody";
import { DataTableFilters, type FilterConfig } from "./dataTableFilters";
import { DataTableDensity } from "./dataTableDensity";
import { type RowDensity } from "./dataTableDensity.utils";
import { DataTableExport, type ExportFormat } from "./dataTableExport";
import { DataTableGrouping, type GroupingConfig } from "./dataTableGrouping";
import { useDataTablePagination, type DataTableApiParamNames, type DataTableApiQueryFormat } from "./useDataTableApi";
import { DataTableSkeleton } from "./dataTableSkeleton";
import { TooltipProvider } from "../../molecules/tooltip";
import { applyAutoTruncateTextCells } from "./data-table-auto-truncate-columns";

function DataTableTooltipShell({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  if (active) {
    return <TooltipProvider delayDuration={200}>{children}</TooltipProvider>;
  }
  return <>{children}</>;
}

// Types
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  urlDatas?: string;
  /** Axios from `createApiClient` when using `urlDatas` — auth, envelope, interceptors. */
  apiClient?: AxiosInstance;
  /** List field path in JSON (default `products`; e.g. `results`). */
  urlDataPath?: string;
  /** Total field path in JSON (default `total`; e.g. `rowCount`). */
  urlTotalPath?: string;
  /** URL query shape: `standard` (`pageNumber` / `pageSize` / …) or `offsetLimit` (`skip` / `limit` / `q`). */
  urlQueryFormat?: DataTableApiQueryFormat;
  /** Override query param names when `urlQueryFormat` is `standard`. */
  urlQueryParamNames?: Partial<DataTableApiParamNames>;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnPinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnVisibility?: boolean;
  enableGrouping?: boolean;
  enableExpanding?: boolean;
  enableFaceting?: boolean;
  enableVirtualization?: boolean;
  enableRowPinning?: boolean;
  enableMultiSort?: boolean;
  enableGlobalFiltering?: boolean;
  enableFuzzyFiltering?: boolean;
  enableColumnFaceting?: boolean;
  enableGlobalFaceting?: boolean;
  enableStickyHeader?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showColumnVisibility?: boolean;
  showColumnOrdering?: boolean;
  showGlobalFilter?: boolean;
  showRowCount?: boolean;
  showSelectedCount?: boolean;
  showExportButtons?: boolean;
  showRefreshButton?: boolean;
  showSettingsButton?: boolean;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  rowClassName?: string | ((row: Row<TData>) => string);
  cellClassName?: string | ((cell: Cell<TData, TValue>) => string);
  /** Stable row id for TanStack Table (recommended when `urlDatas` + server mutations). */
  getRowId?: (row: TData) => string;
  onRowClick?: (row: Row<TData>) => void;
  onRowDoubleClick?: (row: Row<TData>) => void;
  onRowSelect?: (selectedRows: { original: TData }[]) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  onGroupingChange?: (grouping: GroupingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  noDataMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  // Custom renderers
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: (error: string) => React.ReactNode;
  renderPagination?: (table: Table<TData>) => React.ReactNode;
  renderToolbar?: (table: Table<TData>) => React.ReactNode;
  renderFooter?: (table: Table<TData>) => React.ReactNode;
  // Styling
  variant?: "default" | "bordered" | "striped" | "hover";
  size?: "sm" | "md" | "lg";
  // Actions
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: Row<TData>) => void;
    variant?: "default" | "destructive" | "outline";
    disabled?: (row: Row<TData>) => boolean;
  }>;
  showActions?: boolean;
  actionsLabel?: string;
  // Status configuration
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
  // Advanced Features
  filterConfigs?: Record<string, FilterConfig>;
  groupingConfig?: GroupingConfig;
  renderExpandedContent?: (row: TData) => React.ReactNode;
  density?: RowDensity;
  onDensityChange?: (density: RowDensity) => void;
  /** Comfortable / Normal / Compact toggles (default `false` — hidden until you opt in). */
  showDensityControls?: boolean;
  exportConfig?: {
    enabled?: boolean;
    filename?: string;
    formats?: ExportFormat[];
    exportOnlySelected?: boolean;
  };
  inlineEditConfig?: Record<
    string,
    {
      enabled: boolean;
      onSave: (
        rowId: string,
        columnId: string,
        value: unknown
      ) => Promise<void> | void;
      onCancel?: (rowId: string, columnId: string) => void;
      validation?: (value: unknown) => string | null;
      inputType?:
        | "text"
        | "number"
        | "email"
        | "tel"
        | "url"
        | "textarea"
        | "select";
      selectOptions?: { label: string; value: unknown }[];
      placeholder?: string;
    }
  >;
  /**
   * When true (default), columns that only define `accessorKey` / `accessorFn` (no `cell`) get ellipsis + tooltip.
   * Set `meta: { truncateTooltip: false }` on a column to skip. Wraps the main table view in `TooltipProvider`.
   */
  autoTruncateTextCells?: boolean;
}

// Utility functions
const fuzzyFilter = (
  row: Row<unknown>,
  columnId: string,
  value: string,
  addMeta: (meta: { itemRank: { passed: boolean; results: unknown[] } }) => void
) => {
  const itemRank = fuzzySort(value, [row.getValue(columnId)]);
  addMeta({ itemRank });
  return itemRank.passed;
};

const fuzzySort = (value: string, items: unknown[]) => {
  const search = value.toLowerCase();
  const results = items.map((item, index) => ({
    item,
    index,
    score: item ? (item.toString().toLowerCase().includes(search) ? 1 : 0) : 0,
  }));
  return {
    passed: results.some((r) => r.score > 0),
    results: results.sort((a, b) => b.score - a.score),
  };
};

// Main DataTable component
export function DataTable<TData, TValue>({
  columns,
  data: staticData,
  urlDatas,
  apiClient,
  urlDataPath,
  urlTotalPath,
  urlQueryFormat = "standard",
  urlQueryParamNames,
  enableSorting = true,
  enableFiltering = true,
  enableGlobalFilter = true,
  enablePagination = true,
  enableRowSelection = true,
  enableColumnOrdering = true,
  enableColumnPinning = true,
  enableColumnSizing = true,
  enableColumnVisibility = true,
  enableGrouping = true,
  enableExpanding = true,
  enableMultiSort = true,
  enableFuzzyFiltering = true,
  enableStickyHeader = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPagination = true,
  /* showGlobalFilter = true, */
  showRowCount = true,
  showSelectedCount = true,
  showExportButtons = true,
  showRefreshButton = true,
  showSettingsButton = true,
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  cellClassName,
  getRowId,
  onRowClick,
  onRowDoubleClick,
  onRowSelect,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onColumnPinningChange,
  onColumnSizingChange,
  onGroupingChange,
  onExpandedChange,
  onPaginationChange,
  onRowSelectionChange,
  onGlobalFilterChange,
  loading: loadingProp = false,
  error: errorProp,
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
  errorMessage = "An error occurred",
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
  renderPagination,
  renderToolbar,
  renderFooter,
  variant = "default",
  size = "md",
  actions = [],
  showActions = false,
  actionsLabel = "Actions",
  statusConfig,
  columnStatusConfig,
  // Advanced Features
  filterConfigs,
  groupingConfig,
  renderExpandedContent,
  density: densityProp = "normal",
  onDensityChange,
  showDensityControls = false,
  exportConfig,
  autoTruncateTextCells = true,
}: DataTableProps<TData, TValue>) {
  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    enableRowSelection ? { left: ['select'] } : {}
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Advanced Features State
  const [density, setDensity] = useState<RowDensity>(densityProp);
  const [columnFiltersState, setColumnFiltersState] = useState<
    Record<string, unknown>
  >({});
  const [groupingState, setGroupingState] = useState<string[]>([]);

  // API Integration
  const isApiMode = !!urlDatas;
  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
  } = useDataTablePagination<TData>({
    url: urlDatas || "",
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    globalSearch: globalFilter,
    columnFilters,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    paramNames: urlQueryParamNames,
    queryFormat: urlQueryFormat,
    apiClient,
    responseDataPath: urlDataPath,
    responseTotalPath: urlTotalPath,
  });

  // Determine data source
  const data = isApiMode ? apiData?.products || [] : staticData || [];
  const loading = isApiMode ? apiLoading : false;
  const error = isApiMode ? apiError : null;
  const totalCount = isApiMode ? apiData?.total || 0 : staticData?.length || 0;

  const columnsWithAutoTruncate = useMemo(
    () => applyAutoTruncateTextCells(columns, autoTruncateTextCells),
    [columns, autoTruncateTextCells],
  );

  // Memoized columns with selection column
  const memoizedColumns = useMemo(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            id="select-all"
            label=""
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            id={`select-${row.id}`}
            label=""
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={row.getToggleSelectedHandler()}
            className="w-4 h-4"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        size: 50,
      });
    }

    return [...cols, ...columnsWithAutoTruncate];
  }, [columnsWithAutoTruncate, enableRowSelection]);

  // Table instance
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      columnPinning,
      columnSizing,
      grouping,
      expanded,
      pagination,
      rowSelection,
      globalFilter,
    },
    enableRowSelection,
    enableMultiSort,
    enableSorting,
    enableFilters: enableFiltering,
    enableGlobalFilter,
    manualPagination: isApiMode || !enablePagination,
    manualSorting: isApiMode,
    manualFiltering: isApiMode,
    pageCount: isApiMode
      ? Math.max(1, Math.ceil(totalCount / pagination.pageSize))
      : undefined,
    enableColumnResizing: enableColumnSizing,
    enableColumnPinning,
    enableGrouping,
    enableExpanding,
    columnResizeMode: 'onChange',
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onColumnFiltersChange?.(newFilters);
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      onColumnVisibilityChange?.(newVisibility);
    },
    onColumnOrderChange: (updater) => {
      const newOrder =
        typeof updater === "function" ? updater(columnOrder) : updater;
      setColumnOrder(newOrder);
      onColumnOrderChange?.(newOrder);
    },
    onColumnPinningChange: (updater) => {
      const newPinning =
        typeof updater === "function" ? updater(columnPinning) : updater;
      setColumnPinning(newPinning);
      onColumnPinningChange?.(newPinning);
    },
    onColumnSizingChange: (updater) => {
      const newSizing =
        typeof updater === "function" ? updater(columnSizing) : updater;
      setColumnSizing(newSizing);
      onColumnSizingChange?.(newSizing);
    },
    onGroupingChange: (updater) => {
      const newGrouping =
        typeof updater === "function" ? updater(grouping) : updater;
      setGrouping(newGrouping);
      onGroupingChange?.(newGrouping);
    },
    onExpandedChange: (updater) => {
      const newExpanded =
        typeof updater === "function" ? updater(expanded) : updater;
      setExpanded(newExpanded);
      onExpandedChange?.(newExpanded);
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    onGlobalFilterChange: (updater) => {
      const newFilter =
        typeof updater === "function" ? updater(globalFilter) : updater;
      setGlobalFilter(newFilter);
      onGlobalFilterChange?.(newFilter);
    },
    getCoreRowModel: getCoreRowModel(),
    ...(getRowId ? { getRowId: (original: TData) => getRowId(original) } : {}),
    getFilteredRowModel: getFilteredRowModel(),
    ...(isApiMode || !enablePagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: enableFuzzyFiltering ? fuzzyFilter : undefined,
    debugTable: process.env.NODE_ENV === "development",
  });

  // Event handlers
  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      onRowClick?.(row);
    },
    [onRowClick]
  );

  const handleRowDoubleClick = useCallback(
    (row: Row<TData>) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  // Handle row selection callback after state updates
  useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => ({ original: row.original }));
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, table]);

  // Styling classes
  const tableClasses = useMemo(() => cn(
    "w-full border-collapse table-fixed text-foreground",
    {
      "border-border rounded-lg border": variant === "bordered",
      "divide-border divide-y": variant === "striped",
    },
    tableClassName
  ), [variant, tableClassName]);

  // Get column widths for consistent alignment
  const columnWidths = useMemo(() => {
    return table.getAllColumns().reduce((acc, column) => {
      acc[column.id] = column.getSize();
      return acc;
    }, {} as Record<string, number>);
  }, [table.getAllColumns(), columnSizing]);

  // Loading state - only show full loading when no data and no API mode
  if ((loading || loadingProp) && data.length === 0 && !isApiMode) {
    return (
      <div className={cn("w-full", className)}>
        {renderToolbar && renderToolbar(table)}
        <div className="flex items-center justify-center h-64">
          {renderLoadingState ? (
            renderLoadingState()
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCwIcon className="w-5 h-5 animate-spin" />
              <span>{loadingMessage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error || errorProp) {
    return (
      <div className={cn("w-full", className)}>
        {renderToolbar && renderToolbar(table)}
        <div className="flex items-center justify-center h-64">
          {renderErrorState ? (
            renderErrorState(error?.message || errorProp || "An error occurred")
          ) : (
            <div className="text-center">
              <div className="text-red-500 mb-2">{errorMessage}</div>
              <div className="text-muted-foreground text-sm">
                {error?.message || errorProp}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state - only show when not loading and not in API mode
  if (data.length === 0 && !(loading || loadingProp) && !isApiMode) {
    return (
      <div className={cn("w-full", className)}>
        {renderToolbar && renderToolbar(table)}
        <div className="flex items-center justify-center h-64">
          {renderEmptyState ? (
            renderEmptyState()
          ) : (
            <div className="text-center">
              <div className="text-muted-foreground mb-2">{emptyMessage}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DataTableTooltipShell active={autoTruncateTextCells}>
    <div className={cn("w-full", className)}>
      {/* Toolbar */}
      <div className="border-border flex flex-col items-start justify-between gap-4 border-b p-4 sm:flex-row sm:items-center">
        <div className={cn("transition-all duration-300 ease-in-out")}>
          {renderToolbar ? (
            renderToolbar(table)
          ) : (
            <DataTableToolbar
              table={table}
              showSelectedCount={showSelectedCount}
              showExportButtons={showExportButtons}
              showRefreshButton={showRefreshButton}
              showSettingsButton={showSettingsButton}
              loading={loading}
              onSettingsToggle={() => setShowSettings(!showSettings)}
            />
          )}
        </div>
        {/* Advanced Filters */}
        {filterConfigs && Object.keys(filterConfigs).length > 0 && (
          <div className={cn("transition-all duration-300 ease-in-out")}>
            <DataTableFilters
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              columnFilters={columnFiltersState}
              setColumnFilters={setColumnFiltersState}
              filterConfigs={filterConfigs}
            />
          </div>
        )}

        {/* Grouping */}
        {groupingConfig?.enabled && (
          <div className={cn("transition-all duration-300 ease-in-out")}>
            <DataTableGrouping
              table={table}
              config={{
                ...groupingConfig,
                groupBy: groupingState,
                onGroupByChange: setGroupingState,
              }}
              data={data}
            />
          </div>
        )}
      </div>

      {/* Density + export row */}
      {(showDensityControls || exportConfig?.enabled) && (
      <div
        className={cn(
          "flex items-center mb-4 transition-all duration-300 ease-in-out",
          showDensityControls && exportConfig?.enabled
            ? "justify-between"
            : "justify-end",
        )}
      >
        {showDensityControls ? (
        <DataTableDensity
          table={table}
          density={density}
          onDensityChange={(newDensity) => {
            setDensity(newDensity);
            onDensityChange?.(newDensity);
          }}
        />
        ) : null}

        {/* Export */}
        {exportConfig?.enabled && (
          <DataTableExport
            table={table}
            data={data}
            filename={exportConfig.filename}
            selectedRows={table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original)}
            exportOnlySelected={exportConfig.exportOnlySelected}
          />
        )}
      </div>
      )}

      {/* Table and Pagination Container */}
      <div
        className={cn("relative transition-all duration-300 ease-in-out", {
          "border-border overflow-hidden rounded-lg border":
            variant === "bordered",
        })}
      >
        {/* Table */}
        <div
          className={cn("overflow-hidden", {
            "border-border rounded-lg border": variant !== "bordered",
            "border-0": variant === "bordered",
          })}
        >
          {/* Settings Sidebar - Shows here when opened */}
          {showSettings && (
            <DataTableSettings
              table={table}
              showColumnVisibility={enableColumnVisibility}
              showColumnOrdering={enableColumnOrdering}
              showColumnPinning={enableColumnPinning}
              showColumnSizing={enableColumnSizing}
              onClose={() => setShowSettings(false)}
            />
          )}

          {enableStickyHeader ? (
            <>
              {/* One scroll container + one table: single horizontal scrollbar; thead stays visible */}
              <div
                className="overflow-x-auto overflow-y-auto h-[60vh] min-h-[12rem] max-h-[80vh] w-full [scrollbar-width:thin]"
              >
                <table
                  className={tableClasses}
                  style={{ minWidth: "1200px", width: "100%" }}
                >
                  <DataTableHeader
                    table={table}
                    headerClassName={headerClassName}
                    stickyThead
                    size={size}
                    density={density}
                    showActions={showActions}
                    actionsLabel={actionsLabel}
                    columnWidths={columnWidths}
                    enableColumnOrdering={enableColumnOrdering}
                    filterConfigs={filterConfigs}
                    columnFilters={columnFiltersState}
                    setColumnFilters={setColumnFiltersState}
                  />
                  {(loading || loadingProp) &&
                  (data.length > 0 || isApiMode) ? (
                    <DataTableSkeleton
                      rows={pagination.pageSize}
                      columns={memoizedColumns.length}
                      className={bodyClassName}
                      hasActions={showActions}
                      hasSelection={enableRowSelection}
                    />
                  ) : (
                    <DataTableBody
                      table={table}
                      bodyClassName={bodyClassName}
                      rowClassName={rowClassName}
                      cellClassName={cellClassName}
                      size={size}
                      density={density}
                      onRowClick={handleRowClick}
                      onRowDoubleClick={handleRowDoubleClick}
                      actions={actions}
                      showActions={showActions}
                      renderExpandedContent={renderExpandedContent}
                      statusConfig={statusConfig}
                      columnStatusConfig={columnStatusConfig}
                      columnWidths={columnWidths}
                    />
                  )}
                </table>
              </div>
            </>
          ) : (
            /* Traditional Table */
            <div
              className="overflow-x-auto overflow-y-auto h-[60vh] min-h-[12rem] max-h-[80vh] w-full"
              style={{ overflow: "scroll", scrollbarWidth: "thin" }}
            >
              <table
                className={tableClasses}
                style={{ minWidth: "max-content", width: "100%" }}
              >
                <DataTableHeader
                  table={table}
                  headerClassName={headerClassName}
                  size={size}
                  density={density}
                  showActions={showActions}
                  actionsLabel={actionsLabel}
                  enableColumnOrdering={enableColumnOrdering}
                  filterConfigs={filterConfigs}
                  columnFilters={columnFiltersState}
                  setColumnFilters={setColumnFiltersState}
                />
                {(loading || loadingProp) && (data.length > 0 || isApiMode) ? (
                  <DataTableSkeleton
                    rows={pagination.pageSize}
                    columns={memoizedColumns.length}
                    className={bodyClassName}
                    hasActions={showActions}
                    hasSelection={enableRowSelection}
                  />
                ) : (
                  <DataTableBody
                    table={table}
                    bodyClassName={bodyClassName}
                    rowClassName={rowClassName}
                    cellClassName={cellClassName}
                    size={size}
                    density={density}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={handleRowDoubleClick}
                    actions={actions}
                    showActions={showActions}
                    renderExpandedContent={renderExpandedContent}
                    statusConfig={statusConfig}
                    columnStatusConfig={columnStatusConfig}
                  />
                )}
              </table>
            </div>
          )}
        </div>

        {/* Scroll indicators */}
        <div
          className="from-background pointer-events-none absolute top-0 right-0 h-full w-4 bg-gradient-to-l to-transparent opacity-0 transition-opacity duration-200"
          id="scroll-indicator-right"
        ></div>
        <div
          className="from-background pointer-events-none absolute bottom-0 left-0 h-4 w-full bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-200"
          id="scroll-indicator-bottom"
        ></div>

        {/* Footer */}
        {renderFooter && renderFooter(table)}

        {/* Pagination */}
        {showPagination && enablePagination && (
          <div className={cn("transition-all duration-300 ease-in-out")}>
            {renderPagination ? (
              renderPagination(table)
            ) : (
              <DataTablePagination
                table={table}
                pageSizeOptions={pageSizeOptions}
                variant={variant}
                totalCount={totalCount}
                isLoading={loading || loadingProp}
                showRowCount={showRowCount}
              />
            )}
          </div>
        )}
      </div>
    </div>
    </DataTableTooltipShell>
  );
}

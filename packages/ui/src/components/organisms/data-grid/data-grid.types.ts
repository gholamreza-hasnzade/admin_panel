import type * as React from "react";
import type { AxiosInstance } from "axios";
import type { ColumnDef } from "@tanstack/react-table";
import type { ButtonProps } from "../../atoms/button";
type FilterType = "text" | "select" | "checkbox" | "date";
type FilterOption = { label: string; value: string };
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
  /** Renders only visible rows for large datasets to reduce main-thread work. */ enableRowVirtualization?: boolean;
  /** Approximate row height used by virtualization (pixels). */ rowVirtualizationEstimateHeight?: number;
  /** Extra rows rendered above/below viewport to avoid flicker while scrolling. */ rowVirtualizationOverscan?: number;
  /** Mobile presentation mode for compact rendering and simplified controls. */ mobileMode?:
    | "off"
    | "auto"
    | "on";
  /** Max viewport width (px) used to detect mobile mode when `mobileMode="auto"`. */ mobileBreakpoint?: number;
  /** Default page size applied when mobile mode is active. */ mobilePageSize?: number;
};

"use client";

import type { ColumnFiltersState } from "@tanstack/react-table";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios, { type AxiosInstance } from "axios";
import { getByPath } from "./data-table-get-by-path";

export interface ApiResponse<T> {
  products: T[];
  total: number;
  skip?: number;
  limit?: number;
}

/** React Query key prefix for `useDataTableApi` / `useDataTablePagination` — use with `invalidateQueries`. */
export const DATA_TABLE_ROOT_QUERY_KEY = "dataTable" as const;

/** Query param names for the default `standard` URL format (`pageNumber`, `pageSize`, …). */
export type DataTableApiParamNames = {
  pageParamName: string;
  limitParamName: string;
  filterParamPrefix: string;
  globalSearchParamName: string;
  sortByParamName: string;
  sortOrderParamName: string;
};

export const DEFAULT_DATA_TABLE_API_PARAM_NAMES: DataTableApiParamNames = {
  pageParamName: "pageNumber",
  limitParamName: "pageSize",
  filterParamPrefix: "filter.",
  globalSearchParamName: "search",
  sortByParamName: "sortBy",
  sortOrderParamName: "order",
};

export type DataTableApiQueryFormat = "standard" | "offsetLimit";

export interface DataTableApiConfig {
  url: string;
  /** 1-based page number for the API (`pageNumber` by default). */
  pageNumber: number;
  pageSize: number;
  /** Free-text search; sent as `search` by default. */
  globalSearch?: string;
  columnFilters?: ColumnFiltersState;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  /** Override any param key to match your backend. */
  paramNames?: Partial<DataTableApiParamNames>;
  /** Extra fixed query pairs (e.g. flags). */
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  /**
   * - `standard`: `pageNumber`, `pageSize`, `filter.*`, `search`, `sortBy`, `order`
   * - `offsetLimit`: `skip`, `limit`, `q` (for APIs like dummyjson.com)
   */
  queryFormat?: DataTableApiQueryFormat;
  /**
   * App axios from `createApiClient` — Bearer, envelope unwrap, `ApiRequestError`, `onUnauthorized`.
   * Prefer passing this when the table calls your API.
   */
  apiClient?: AxiosInstance;
  /** Dot path to list in JSON after unwrap (default `products`; e.g. `results`). */
  responseDataPath?: string;
  /** Dot path to total count (default `total`; e.g. `rowCount`). */
  responseTotalPath?: string;
}

function mergeParamNames(
  partial?: Partial<DataTableApiParamNames>,
): DataTableApiParamNames {
  return { ...DEFAULT_DATA_TABLE_API_PARAM_NAMES, ...partial };
}

function buildDataTableQueryParams(config: DataTableApiConfig): URLSearchParams {
  const params = new URLSearchParams();
  const format = config.queryFormat ?? "standard";

  if (format === "offsetLimit") {
    const skip = (config.pageNumber - 1) * config.pageSize;
    params.set("limit", String(config.pageSize));
    params.set("skip", String(skip));
    if (config.globalSearch?.trim()) {
      params.set("q", config.globalSearch.trim());
    }
  } else {
    const names = mergeParamNames(config.paramNames);
    params.set(names.pageParamName, String(config.pageNumber));
    params.set(names.limitParamName, String(config.pageSize));
    if (config.globalSearch?.trim()) {
      params.set(names.globalSearchParamName, config.globalSearch.trim());
    }
    (config.columnFilters ?? []).forEach((filter) => {
      const value = filter.value;
      if (value !== "" && value !== undefined && value !== null) {
        params.set(`${names.filterParamPrefix}${filter.id}`, String(value));
      }
    });
    if (config.sortBy) {
      params.set(names.sortByParamName, config.sortBy);
      if (config.sortOrder) {
        params.set(names.sortOrderParamName, config.sortOrder);
      }
    }
  }

  if (format === "offsetLimit") {
    if (config.sortBy) {
      params.set("sortBy", config.sortBy);
      if (config.sortOrder) params.set("sortOrder", config.sortOrder);
    }
  }

  Object.entries(config.queryParams ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params;
}

export function useDataTableApi<T>(
  config: DataTableApiConfig,
  enabled: boolean = true,
): UseQueryResult<ApiResponse<T>> {
  const format = config.queryFormat ?? "standard";

  return useQuery({
    queryKey: [
      DATA_TABLE_ROOT_QUERY_KEY,
      config.url,
      format,
      config.pageNumber,
      config.pageSize,
      config.globalSearch,
      config.columnFilters,
      config.sortBy,
      config.sortOrder,
      config.paramNames,
      config.queryParams,
      config.apiClient,
      config.responseDataPath,
      config.responseTotalPath,
    ],
    queryFn: async (): Promise<ApiResponse<T>> => {
      const params = buildDataTableQueryParams(config);
      const paramsRecord = Object.fromEntries(params.entries());
      const client = config.apiClient;
      const { data: body } = client
        ? await client.get<unknown>(config.url, { params: paramsRecord })
        : await axios.get<unknown>(config.url, { params: paramsRecord });
      const listPath = config.responseDataPath ?? "products";
      const totalPath = config.responseTotalPath ?? "total";
      const rowsRaw = getByPath(body, listPath);
      const list: unknown[] = Array.isArray(rowsRaw) ? rowsRaw : [];
      const totalRaw = getByPath(body, totalPath);
      const totalNum =
        typeof totalRaw === "number"
          ? totalRaw
          : Number(totalRaw ?? list.length);
      const total = Number.isFinite(totalNum) ? totalNum : list.length;
      return { products: list as T[], total };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export type UseDataTablePaginationArgs = {
  url: string;
  pageIndex: number;
  pageSize: number;
  globalSearch?: string;
  columnFilters?: ColumnFiltersState;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  paramNames?: Partial<DataTableApiParamNames>;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  queryFormat?: DataTableApiQueryFormat;
  apiClient?: AxiosInstance;
  responseDataPath?: string;
  responseTotalPath?: string;
};

/** Server-backed table: query key includes URL, `standard` | `offsetLimit`, pagination, filters, sort. */
export function useDataTablePagination<T>(args: UseDataTablePaginationArgs) {
  const {
    url,
    pageIndex,
    pageSize,
    globalSearch,
    columnFilters,
    sortBy,
    sortOrder,
    paramNames,
    queryParams,
    queryFormat,
    apiClient,
    responseDataPath,
    responseTotalPath,
  } = args;

  return useDataTableApi<T>(
    {
      url,
      pageNumber: pageIndex + 1,
      pageSize,
      globalSearch,
      columnFilters,
      sortBy,
      sortOrder,
      paramNames,
      queryParams,
      queryFormat,
      apiClient,
      responseDataPath,
      responseTotalPath,
    },
    Boolean(url),
  );
}

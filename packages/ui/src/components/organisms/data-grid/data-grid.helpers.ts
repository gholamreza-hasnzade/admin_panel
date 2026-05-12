import type { AxiosInstance } from "axios";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { DataGridColumnDef } from "./data-grid.types";
export function getByPath(obj: unknown, path: string) {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}
export function areColumnFiltersEqual(
  a: ColumnFiltersState,
  b: ColumnFiltersState,
): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      other &&
      item.id === other.id &&
      String(item.value ?? "") === String(other.value ?? "")
    );
  });
}
type BuildRequestParamsArgs = {
  pageParamName: string;
  limitParamName: string;
  skipParamName: string | false;
  pagination: { pageIndex: number; pageSize: number };
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  filterParamPrefix: string;
  debouncedGlobalSearch: string;
  globalSearchParamName: string;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  sortByParamName: string;
  sortOrderParamName: string;
};
export function buildRequestParams({
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
}: BuildRequestParamsArgs): URLSearchParams {
  const params = new URLSearchParams();
  params.set(pageParamName, String(pagination.pageIndex + 1));
  params.set(limitParamName, String(pagination.pageSize));
  if (skipParamName) {
    params.set(
      skipParamName,
      String(pagination.pageIndex * pagination.pageSize),
    );
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
}
/** Applies grid `meta` to column defs. Filtering is server-side (`manualFiltering`); no client `filterFn`. */
export function buildEnhancedColumns<TData>(
  columns: DataGridColumnDef<TData>[],
): DataGridColumnDef<TData>[] {
  return columns.map((column) => {
    const meta = column.meta;
    const sortable = meta?.sortable ?? column.enableSorting ?? false;
    return {
      ...column,
      enableSorting: sortable,
    };
  });
}
export async function fetchGridData<TData>(args: {
  apiClient?: AxiosInstance;
  url: string;
  requestParamsObject: Record<string, string>;
  mapData?: (raw: unknown) => TData[];
  dataPath: string;
  totalPath: string;
}): Promise<{ data: TData[]; totalRows: number }> {
  const { apiClient, url, requestParamsObject, mapData, dataPath, totalPath } =
    args;
  const raw: unknown = apiClient
    ? (await apiClient.get(url, { params: requestParamsObject })).data
    : await (async () => {
        const parsedUrl = new URL(
          url,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost",
        );
        Object.entries(requestParamsObject).forEach(([key, value]) => {
          parsedUrl.searchParams.set(key, value);
        });
        const response = await fetch(parsedUrl.toString());
        if (!response.ok)
          throw new Error(`Request failed with status ${response.status}`);
        return response.json() as Promise<unknown>;
      })();
  const mapped = mapData
    ? mapData(raw)
    : (((getByPath(raw, dataPath) ?? raw) as TData[] | undefined) ?? []);
  if (!Array.isArray(mapped)) {
    throw new Error("Mapped response is not an array.");
  }
  const total = Number(getByPath(raw, totalPath) ?? mapped.length);
  return {
    data: mapped,
    totalRows: Number.isFinite(total) ? total : mapped.length,
  };
}
export function toGridErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  return "خطا در دریافت اطلاعات";
}

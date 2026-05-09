import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { QueryFunction, QueryKey } from "@tanstack/react-query";

/**
 * `useQuery` helper: GET and return `response.data`.
 * Errors are already {@link import("./errors").ApiRequestError} from {@link createApiClient}.
 */
export function createGetQueryFn<TData>(
  client: AxiosInstance,
  requestConfig?: Omit<AxiosRequestConfig, "url" | "method">,
): QueryFunction<TData, QueryKey> {
  return async ({ queryKey, signal }) => {
    const path = queryKey[0];
    if (typeof path !== "string" || !path) {
      throw new Error("createGetQueryFn: queryKey[0] must be a non-empty URL path string.");
    }
    const { data } = await client.get<TData>(path, {
      ...requestConfig,
      signal: signal ?? requestConfig?.signal,
    });
    return data;
  };
}

/**
 * Same as {@link createGetQueryFn} but the first segment of `queryKey` is the path.
 * Example: `queryKey: ['/users', userId]` → GET `/users/${userId}`.
 */
export function createGetByPartsQueryFn<TData>(
  client: AxiosInstance,
  joinPath: (parts: readonly unknown[]) => string,
  requestConfig?: Omit<AxiosRequestConfig, "url" | "method">,
): QueryFunction<TData, QueryKey> {
  return async ({ queryKey, signal }) => {
    const path = joinPath(queryKey);
    const { data } = await client.get<TData>(path, {
      ...requestConfig,
      signal: signal ?? requestConfig?.signal,
    });
    return data;
  };
}

import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export type TokenResolver = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

/** When set, JSON bodies like `{ resultCode, data }` are validated: success unwraps `data` onto `response.data`; failure rejects {@link import("./errors").ApiRequestError}. */
export type ApiEnvelopeConfig = {
  resultCodeField?: string;
  dataField?: string;
  /** Business success code inside the envelope (default `200`). */
  successResultCode?: number;
};

export type ApiClientConfig = {
  baseURL: string;
  /** Prepended to every request URL unless the URL is absolute. */
  axiosDefaults?: Omit<AxiosRequestConfig, "baseURL">;
  /** Authorization: Bearer … on each request when truthy. */
  getAccessToken?: TokenResolver;
  /** Runs once per failed request with HTTP 401. */
  onUnauthorized?: (error: AxiosError) => void | Promise<void>;
  /** Merged into every request after defaults. */
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  withCredentials?: boolean;
  envelope?: ApiEnvelopeConfig;
  /** When any matcher returns true, `getAccessToken` is not applied for that request. */
  skipAuthorizationWhen?: (request: InternalAxiosRequestConfig) => boolean;
};

export type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig };

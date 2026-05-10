import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export type TokenResolver = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

/** Known semantics for backend `resultCode` (when different from business success). */
export const API_BUSINESS_RESULT_CODE = {
  EXCEPTION: 1,
  INFORMATION: 2,
  WARNING: 3,
  /** Session ended / token expired — client should clear auth and sign out. */
  LOGOUT: 4,
} as const;

/**
 * When set, JSON bodies like `{ resultCode, data }` are validated: success unwraps `data` onto `response.data`; failure rejects {@link import("./errors").ApiRequestError}.
 *
 * Many backends keep **HTTP status 200** for every response and put the real outcome in `resultCode` (auth expiry as `4`, etc.). In that case envelope handling is required; relying only on HTTP 401 is not enough.
 */
export type ApiEnvelopeConfig = {
  resultCodeField?: string;
  dataField?: string;
  /** Business success code inside the envelope (default `200`). */
  successResultCode?: number;
  /**
   * `resultCode` values that mean the session must end (e.g. expired token).
   * Default includes {@link API_BUSINESS_RESULT_CODE.LOGOUT}. Pass `[]` to treat those like normal errors.
   */
  logoutResultCodes?: readonly number[];
};

export type ApiClientConfig = {
  baseURL: string;
  /** Prepended to every request URL unless the URL is absolute. */
  axiosDefaults?: Omit<AxiosRequestConfig, "baseURL">;
  /** Authorization: Bearer … on each request when truthy. */
  getAccessToken?: TokenResolver;
  /**
   * Runs on HTTP **401** (when it occurs) and on envelope **`resultCode`** listed in {@link ApiEnvelopeConfig.logoutResultCodes} (default **`4`**).
   * If the API always returns HTTP 200, session expiry is typically **only** the envelope path (`resultCode` 4), not 401.
   */
  onUnauthorized?: (error?: AxiosError) => void | Promise<void>;
  /** Merged into every request after defaults. */
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  withCredentials?: boolean;
  envelope?: ApiEnvelopeConfig;
  /** When any matcher returns true, `getAccessToken` is not applied for that request. */
  skipAuthorizationWhen?: (request: InternalAxiosRequestConfig) => boolean;
};

export type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig };

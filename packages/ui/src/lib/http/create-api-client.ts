import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from "axios";
import { ApiRequestError, isApiRequestError, toApiRequestError } from "./errors";
import type { ApiClientConfig, ApiEnvelopeConfig } from "./types";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

type RequestConfigWithAuthFlag = { _skipAuthRefresh?: boolean };

async function unwrapEnvelope(
  envelope: ApiEnvelopeConfig,
  response: AxiosResponse,
  handlers: {
    onUnauthorized?: (error?: AxiosError) => void | Promise<void>;
  },
): Promise<AxiosResponse> {
  const resultCodeField = envelope.resultCodeField ?? "resultCode";
  const dataField = envelope.dataField ?? "data";
  const successResultCode = envelope.successResultCode ?? 200;
  const logoutResultCodes =
    envelope.logoutResultCodes ?? [4];
  const payload = response.data;

  if (payload == null || typeof payload !== "object") {
    return response;
  }

  const record = payload as Record<string, unknown>;
  if (!(resultCodeField in record)) {
    return response;
  }

  const rc = record[resultCodeField];
  if (typeof rc !== "number") {
    return response;
  }

  if (rc === successResultCode) {
    response.data = record[dataField];
    return response;
  }

  const rawMsg = record[dataField];
  const message =
    typeof rawMsg === "string" && rawMsg.trim()
      ? rawMsg
      : `خطای سرور (${String(rc)})`;

  if (logoutResultCodes.includes(rc) && handlers.onUnauthorized) {
    try {
      await handlers.onUnauthorized();
    } catch {
      /* consumer decides */
    }
  }

  throw new ApiRequestError(message, {
    status: response.status,
    body: payload,
    resultCode: rc,
  });
}

/**
 * Shared axios instance with request/response interceptors for browser (and SSR) apps.
 * Pass `baseURL` from env, e.g. `process.env.NEXT_PUBLIC_APP_API_BASE_URL` in Next.js.
 *
 * When `envelope` is set: failures (including auth expiry as `resultCode` 4) often arrive with **HTTP 200**; they are turned into rejected promises after optional `onUnauthorized`.
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const {
    baseURL,
    getAccessToken,
    onUnauthorized,
    defaultHeaders,
    timeoutMs = 60_000,
    withCredentials = false,
    axiosDefaults,
    envelope,
    skipAuthorizationWhen,
  } = config;

  const instance = axios.create({
    ...axiosDefaults,
    baseURL: trimTrailingSlash(baseURL),
    timeout: timeoutMs,
    withCredentials,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(axiosDefaults?.headers as Record<string, string> | undefined),
      ...defaultHeaders,
    },
  });

  instance.interceptors.request.use(
    async (req) => {
      if (!getAccessToken || skipAuthorizationWhen?.(req)) return req;
      const token = await getAccessToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      } else {
        delete req.headers.Authorization;
      }
      return req;
    },
    (err) => Promise.reject(toApiRequestError(err)),
  );

  instance.interceptors.response.use(
    async (response) => {
      if (envelope) {
        return unwrapEnvelope(envelope, response, { onUnauthorized });
      }
      return response;
    },
    async (error) => {
      if (isApiRequestError(error)) {
        return Promise.reject(error);
      }

      if (!isAxiosError(error)) {
        return Promise.reject(toApiRequestError(error));
      }

      const normalized = toApiRequestError(error);
      const cfg = error.config as RequestConfigWithAuthFlag | undefined;
      if (
        normalized.status === 401 &&
        onUnauthorized &&
        !cfg?._skipAuthRefresh
      ) {
        try {
          await onUnauthorized(error);
        } catch {
          /* consumer decides */
        }
      }

      return Promise.reject(normalized);
    },
  );

  return instance;
}

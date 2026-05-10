import type { AxiosError } from "axios";

export class ApiRequestError extends Error {
  readonly status: number | undefined;
  readonly body: unknown;
  readonly code: string | undefined;
  /** Present when the failure came from a JSON envelope (`resultCode` / `data`). */
  readonly resultCode: number | undefined;
  readonly isApiRequestError = true as const;

  constructor(
    message: string,
    options: {
      status?: number;
      body?: unknown;
      code?: string;
      cause?: unknown;
      resultCode?: number;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiRequestError";
    this.status = options.status;
    this.body = options.body;
    this.code = options.code;
    this.resultCode = options.resultCode;
  }
}

export function isApiRequestError(value: unknown): value is ApiRequestError {
  return (
    typeof value === "object" &&
    value !== null &&
    "isApiRequestError" in value &&
    (value as ApiRequestError).isApiRequestError === true
  );
}

function pickMessageFromBody(body: unknown): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;
  if (typeof record.resultCode === "number" && typeof record.data === "string" && record.data.trim()) {
    if (record.resultCode !== 200) return record.data;
  }
  const msg = record.message ?? record.error ?? record.title;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(record.errors) && record.errors.length) {
    const first = record.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      const m = (first as { message?: unknown }).message;
      if (typeof m === "string") return m;
    }
  }
  return undefined;
}

/**
 * Maps axios failures to {@link ApiRequestError} for stable handling in UI and TanStack Query.
 */
export function toApiRequestError(error: unknown): ApiRequestError {
  if (isApiRequestError(error)) return error;

  const ax = error as Partial<AxiosError<unknown>>;
  if (ax.isAxiosError && ax.response) {
    const status = ax.response.status;
    const body = ax.response.data;
    const fromBody = pickMessageFromBody(body);
    const fallback =
      typeof ax.message === "string" && ax.message ? ax.message : "درخواست ناموفق بود.";
    return new ApiRequestError(fromBody ?? fallback, {
      status,
      body,
      code: ax.code,
      cause: error,
    });
  }

  if (ax.isAxiosError && ax.request && !ax.response) {
    return new ApiRequestError("پاسخی از سرور دریافت نشد. اتصال شبکه را بررسی کنید.", {
      code: ax.code,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message, { cause: error });
  }

  return new ApiRequestError("خطای ناشناخته", { cause: error });
}

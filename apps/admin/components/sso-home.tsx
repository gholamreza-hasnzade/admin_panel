"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Button,
  isApiRequestError,
  Skeleton,
  SpinnerIcon,
  toast,
} from "@repo/ui";

import { api } from "@/lib/api";
import { getAccessToken, setAccessToken, syncSessionFromStorage } from "@/lib/auth-token";

const MEDU_SSO_ENTRY =
  process.env.NEXT_PUBLIC_SSO_PORTAL_URL ?? "https://my.medu.ir/app/NoAmoz/TestEs";

/** پورتال در تب جدید؛ تب فعلی بسته می‌شود اگر مرورگر اجازه دهد (معمولاً وقتی این پنجره با `window.open` از پورتال باز شده). */
function openPortalInNewTabAndCloseThisWindow(): void {
  window.open(MEDU_SSO_ENTRY, "_blank", "noopener,noreferrer");
  window.close();
}

function errorMessage(error: unknown): string {
  if (isApiRequestError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "خطای ناشناخته";
}

async function exchangeSsoCode(code: string): Promise<string> {
  const { data } = await api.post<string>("/api/Security/Login", undefined, {
    params: { code },
  });
  if (typeof data !== "string" || !data.trim()) {
    throw new Error("توکن معتبر از سرور دریافت نشد.");
  }
  return data.trim();
}

export function SsoHomeFallback() {
  return (
    <div
      className="flex min-h-[40vh] w-full max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8 shadow-sm"
      role="status"
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      <SpinnerIcon className="size-10 text-primary" />
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-4 w-[75%] self-center" />
        <Skeleton className="h-4 w-1/2 self-center" />
      </div>
      <p className="text-center text-sm text-muted-foreground">در حال آماده‌سازی…</p>
    </div>
  );
}

export function SsoHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const errorToastKey = useRef<string | null>(null);
  const successHandledForCode = useRef<string | null>(null);

  useLayoutEffect(() => {
    syncSessionFromStorage();
    setHasToken(Boolean(getAccessToken()));
  }, []);

  const loginQuery = useQuery({
    queryKey: ["security-sso-login", code],
    queryFn: () => exchangeSsoCode(code!),
    enabled: Boolean(code?.trim()),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  useEffect(() => {
    if (!loginQuery.isSuccess || !code) return;
    if (successHandledForCode.current === code) return;
    successHandledForCode.current = code;
    const token = loginQuery.data;
    setAccessToken(token);
    setHasToken(true);
    toast.success("ورود با موفقیت انجام شد.");
    router.replace("/dashboard");
  }, [loginQuery.isSuccess, loginQuery.data, code, router]);

  useEffect(() => {
    if (hasToken !== true || code?.trim()) return;
    router.replace("/dashboard");
  }, [hasToken, code, router]);

  useEffect(() => {
    if (!loginQuery.isError || !loginQuery.error) return;
    const msg = errorMessage(loginQuery.error);
    if (errorToastKey.current === msg) return;
    errorToastKey.current = msg;
    toast.error(msg);
  }, [loginQuery.isError, loginQuery.error]);

  const showLoading = Boolean(code?.trim()) && loginQuery.isPending;
  const showError = Boolean(code?.trim()) && loginQuery.isError;
  const baseUrlMissing = !process.env.NEXT_PUBLIC_APP_API_BASE_URL;

  if (hasToken === null && !code?.trim()) {
    return <SsoHomeFallback />;
  }

  if (baseUrlMissing) {
    return (
      <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-destructive">پیکربندی ناقص</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          متغیر محیطی <code className="rounded bg-muted px-1">NEXT_PUBLIC_APP_API_BASE_URL</code>{" "}
          تنظیم نشده است.
        </p>
      </div>
    );
  }

  if (showLoading) {
    return (
      <div
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-card px-8 py-10 shadow-sm"
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="در حال ورود به سامانه"
      >
        <SpinnerIcon className="size-12 text-primary" />
        <div className="space-y-1 text-center">
          <p className="text-base font-medium text-foreground">در حال ورود…</p>
          <p className="text-sm text-muted-foreground">
            لطفاً چند لحظه صبر کنید؛ در حال تأیید کد ورود از پورتال هستیم.
          </p>
        </div>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div role="alert" aria-live="assertive" className="space-y-2">
          <h1 className="text-lg font-semibold text-destructive">ورود ناموفق</h1>
          <p className="text-sm leading-relaxed text-foreground">
            {errorMessage(loginQuery.error)}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => loginQuery.refetch()}>
            تلاش دوباره
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              openPortalInNewTabAndCloseThisWindow();
            }}
          >
            بازگشت به پورتال
          </Button>
        </div>
      </div>
    );
  }

  if (hasToken === true && !code?.trim()) {
    return (
      <div
        className="flex min-h-[40vh] w-full max-w-md flex-col items-center justify-center gap-3"
        role="status"
        aria-label="در حال ورود به پنل"
      >
        <SpinnerIcon className="size-10 text-primary" />
        <p className="text-center text-sm text-muted-foreground">در حال هدایت به پنل…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-center text-lg font-semibold">ورود به پنل مدیریت</h1>
      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        برای ورود امن، از دکمهٔ ورود در پورتال آموزشی استفاده کنید؛ پس از هدایت به این صفحه، ورود
        به‌صورت خودکار انجام می‌شود.
      </p>
      <Button className="w-full" variant="default" asChild>
        <a href={MEDU_SSO_ENTRY} target="_blank" rel="noopener noreferrer">
          رفتن به پورتال ورود
        </a>
      </Button>
    </div>
  );
}

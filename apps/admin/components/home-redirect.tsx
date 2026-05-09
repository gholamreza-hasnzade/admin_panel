"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

import { SpinnerIcon } from "@repo/ui";

import { getAccessToken, syncSessionFromStorage } from "@/lib/auth-token";

/** ریشهٔ سایت: فقط هدایت به لاگین یا داشبورد؛ بدون کروم اضافی. */
export function HomeRedirect() {
  const router = useRouter();

  useLayoutEffect(() => {
    syncSessionFromStorage();
    if (getAccessToken()) router.replace("/dashboard");
    else router.replace("/login");
  }, [router]);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-muted/30"
      role="status"
      aria-label="در حال هدایت"
    >
      <SpinnerIcon className="size-10 text-primary" />
    </div>
  );
}

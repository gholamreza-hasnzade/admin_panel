"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SpinnerIcon } from "@repo/ui";

import { getAccessToken, syncSessionFromStorage } from "@/lib/auth-token";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    syncSessionFromStorage();
    setAllowed(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    if (allowed === false) {
      router.replace("/login");
    }
  }, [allowed, router]);

  if (allowed !== true) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-4"
        role="status"
        aria-live="polite"
        aria-label="در حال بررسی نشست"
      >
        <SpinnerIcon className="size-10 text-primary" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری پنل…</p>
      </div>
    );
  }

  return children;
}

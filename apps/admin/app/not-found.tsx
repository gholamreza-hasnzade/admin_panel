import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";

import { Button } from "@repo/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <p
          className="text-7xl font-bold tracking-tight text-primary/85 tabular-nums"
          aria-hidden
        >
          404
        </p>
        <h1 className="text-xl font-semibold text-foreground">صفحه یافت نشد</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          آدرسی که باز کردید در این پنل وجود ندارد، یا به مسیر دیگری منتقل شده است.
        </p>
      </div>

      <nav
        className="flex flex-wrap items-center justify-center gap-3"
        aria-label="مسیرهای پیشنهادی"
      >
        <Button asChild>
          <Link href="/dashboard" className="gap-2">
            <LayoutDashboard className="size-4" aria-hidden />
            داشبورد
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/" className="gap-2">
            <Home className="size-4" aria-hidden />
            صفحهٔ اصلی
          </Link>
        </Button>
      </nav>
    </main>
  );
}

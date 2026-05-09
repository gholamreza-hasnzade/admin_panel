import { Suspense } from "react";

import { SsoHome, SsoHomeFallback } from "@/components/sso-home";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-3 py-6 sm:px-4">
      <Suspense fallback={<SsoHomeFallback />}>
        <SsoHome />
      </Suspense>
    </main>
  );
}
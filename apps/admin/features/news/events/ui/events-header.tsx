"use client";

import { Button } from "@repo/ui";

export function EventsHeader({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">مدیریت رویدادها</h2>
      <Button type="button" onClick={onAddClick}>افزودن رویداد</Button>
    </div>
  );
}

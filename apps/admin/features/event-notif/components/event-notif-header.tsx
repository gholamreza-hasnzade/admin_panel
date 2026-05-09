"use client";

import { Button } from "@repo/ui";

type EventNotifHeaderProps = {
  onAddClick: () => void;
};

export function EventNotifHeader({ onAddClick }: EventNotifHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">مدیریت اعلان ها</h2>
      <Button onClick={onAddClick}>افزودن اعلان</Button>
    </div>
  );
}

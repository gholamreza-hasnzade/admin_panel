"use client";

import { Button } from "@repo/ui";

type NotifHeaderProps = {
  onAddClick: () => void;
};

export function NotifHeader({ onAddClick }: NotifHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">مدیریت اعلان ها</h2>
      <Button onClick={onAddClick}>افزودن اعلان</Button>
    </div>
  );
}

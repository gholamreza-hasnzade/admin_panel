"use client";

import { Button } from "@repo/ui";

type EventSliderHeaderProps = {
  onAddClick: () => void;
};

export function EventSliderHeader({ onAddClick }: EventSliderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">مدیریت اسلایدر</h2>
      <Button type="button" variant="default" onClick={onAddClick}>
        افزودن اسلایدر
      </Button>
    </div>
  );
}

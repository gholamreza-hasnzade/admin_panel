"use client";

import { Button } from "@repo/ui";

type SliderHeaderProps = {
  onAddClick: () => void;
};

export function SliderHeader({ onAddClick }: SliderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">مدیریت اسلایدر</h2>
      <Button type="button" variant="default" onClick={onAddClick}>
        افزودن اسلایدر
      </Button>
    </div>
  );
}

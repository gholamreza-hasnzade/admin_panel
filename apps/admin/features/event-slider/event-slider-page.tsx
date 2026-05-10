"use client";

import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

import { EventSliderManager } from "./ui/event-slider-manager";

export function EventSliderPage() {
  return (
    <div className="event-slider-page w-full space-y-3">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "رویدادها" },
          { label: "اسلایدر" },
        ]}
      />
      <EventSliderManager />
    </div>
  );
}

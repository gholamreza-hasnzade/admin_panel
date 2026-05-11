"use client";

import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

import { SliderManager } from "./ui/slider-manager";

export function SliderPage() {
  return (
    <div className="slider-page w-full space-y-3">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "رویدادها" },
          { label: "اسلایدر" },
        ]}
      />
      <SliderManager />
    </div>
  );
}

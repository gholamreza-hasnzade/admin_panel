"use client";

import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

import { EventsManager } from "./ui/events-manager";

export function EventsPage() {
  return (
    <div className="events-page w-full space-y-3">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "اخبار" },
          { label: "رویدادها" },
        ]}
      />
      <EventsManager />
    </div>
  );
}

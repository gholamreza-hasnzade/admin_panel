"use client";

import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

import { EventNotifManager } from "./ui/event-notif-manager";

export function EventNotifPage() {
  return (
    <div className="event-notif-page w-full space-y-3">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "رویدادها" },
          { label: "اعلان‌ها" },
        ]}
      />
      <EventNotifManager />
    </div>
  );
}

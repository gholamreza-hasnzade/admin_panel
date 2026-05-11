"use client";

import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

import { NotifManager } from "./ui/notif-manager";

export function NotifPage() {
  return (
    <div className="notif-page w-full space-y-3">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "رویدادها" },
          { label: "اعلان‌ها" },
        ]}
      />
      <NotifManager />
    </div>
  );
}

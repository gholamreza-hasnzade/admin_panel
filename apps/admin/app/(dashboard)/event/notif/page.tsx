import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";
import { EventNotifManager } from "@/features/event-notif/components/event-notif-manager";

export default function NotificationNewsPage() {
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

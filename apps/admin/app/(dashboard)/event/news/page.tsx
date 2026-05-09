import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";

export default function EventNewsPage() {
  return (
    <div className="admin-page-stack">
      <AdminBreadcrumbs
        items={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "رویدادها" },
          { label: "اخبار" },
        ]}
      />
      <h2 className="text-lg font-semibold">مدیریت اخبار</h2>
      <p className="text-sm text-muted-foreground">این صفحه برای مدیریت خبرها و اعلان‌های رویدادها آماده است.</p>
    </div>
  );
}

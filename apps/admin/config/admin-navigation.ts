import type { LucideIcon } from "lucide-react";
import {
  Building2,
  LayoutDashboard,
  Network,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: AdminNavItem[];
};

/** منوی اصلی پنل؛ برای تم‌های دیگر فقط همین آرایه (یا نسخهٔ مشابه) را عوض کنید. */
export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", label: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
   {
    id: "news",
    label: "اخبار",
    icon: Building2,
    children: [
      { id: "news-slider", label: "اسلایدر", href: "/news/slider", icon: Network },
      { id: "news-notif", label: "اعلان ها", href: "/news/notif", icon: Network },
      { id: "news-events", label: "رویدادها", href: "/news/events", icon: Network },
    ],
  },
];

export function getAdminPageTitle(pathname: string, items: AdminNavItem[] = ADMIN_NAV): string {
  const flat: { href: string; label: string }[] = [];
  const collect = (nodes: AdminNavItem[]) => {
    for (const n of nodes) {
      if (n.href) flat.push({ href: n.href, label: n.label });
      if (n.children) collect(n.children);
    }
  };
  collect(items);
  flat.sort((a, b) => b.href.length - a.href.length);
  const hit = flat.find((e) => pathname === e.href || pathname.startsWith(`${e.href}/`));
  return hit?.label ?? "پنل مدیریت";
}

/** شناسهٔ گروه‌هایی که باید برای نمایش مسیر فعال باز باشند. */
export function getOpenNavGroupIds(pathname: string, items: AdminNavItem[]): Set<string> {
  const result = new Set<string>();

  function walk(nodes: AdminNavItem[], ancestorIds: string[]): boolean {
    let found = false;
    for (const n of nodes) {
      if (n.href && (pathname === n.href || pathname.startsWith(`${n.href}/`))) {
        ancestorIds.forEach((id) => result.add(id));
        found = true;
      }
      if (n.children?.length) {
        if (walk(n.children, [...ancestorIds, n.id])) {
          ancestorIds.forEach((id) => result.add(id));
          found = true;
        }
      }
    }
    return found;
  }

  walk(items, []);
  return result;
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

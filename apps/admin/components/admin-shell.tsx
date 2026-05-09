"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, PanelLeftClose, PanelRightClose, Settings } from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  UserIdentityHub,
} from "@repo/ui";

import {
  ADMIN_NAV,
  type AdminNavItem,
  getAdminPageTitle,
  getOpenNavGroupIds,
  isNavLinkActive,
} from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "mymedu_admin_sidebar_collapsed";
const ACCESS_TOKEN_STORAGE_KEY = "mymedu_admin_access_token";
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SSO_PORTAL_URL ?? "https://my.medu.ir";

export type AdminShellBrand = {
  name: string;
  subtitle?: string;
  logoLetter?: string;
};

type AdminShellProps = {
  children: React.ReactNode;
  brand?: AdminShellBrand;
};

function NavIconButton({
  children,
  label,
  collapsed,
}: {
  children: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="left" className="max-w-56">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarNav({
  items,
  depth,
  pathname,
  collapsed,
  expanded,
  toggleGroup,
  onNavigate,
  expandSidebarAndOpen,
}: {
  items: AdminNavItem[];
  depth: number;
  pathname: string;
  collapsed: boolean;
  expanded: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onNavigate: () => void;
  expandSidebarAndOpen: (id: string) => void;
}) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-0.5",
        depth > 0 && "mt-1 ms-4 border-s border-border/60 ps-3",
      )}
    >
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const open = expanded[item.id] ?? false;

        if (hasChildren) {
          const childActive = item.children!.some(
            (c) => c.href && isNavLinkActive(pathname, c.href),
          );
          const Icon = item.icon;

          if (collapsed && depth === 0) {
            return (
              <li key={item.id}>
                <NavIconButton label={`${item.label} — باز کردن منو`} collapsed={collapsed}>
                  <button
                    type="button"
                    aria-label={`باز کردن منوی ${item.label}`}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors",
                      "text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                      childActive && "bg-primary/15 text-primary",
                    )}
                    onClick={() => expandSidebarAndOpen(item.id)}
                  >
                    <Icon className="size-[1.15rem] shrink-0 opacity-90" aria-hidden />
                  </button>
                </NavIconButton>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
                  "text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                  depth > 0 && "ps-4 text-[0.82rem]",
                  childActive && "bg-accent/80 text-foreground",
                )}
                onClick={() => toggleGroup(item.id)}
              >
                <Icon className="size-[1.15rem] shrink-0 opacity-90" aria-hidden />
                {!collapsed ? (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        open ? "-rotate-180" : "",
                      )}
                      aria-hidden
                    />
                  </>
                ) : null}
              </button>
              {open && !collapsed ? (
                <SidebarNav
                  items={item.children!}
                  depth={depth + 1}
                  pathname={pathname}
                  collapsed={collapsed}
                  expanded={expanded}
                  toggleGroup={toggleGroup}
                  onNavigate={onNavigate}
                  expandSidebarAndOpen={expandSidebarAndOpen}
                />
              ) : null}
            </li>
          );
        }

        if (!item.href) return null;
        const active = isNavLinkActive(pathname, item.href);
        const Icon = item.icon;
        const linkClass = cn(
          "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
          "text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
          active && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground",
          depth > 0 && "ps-4 text-[0.82rem]",
          collapsed && "justify-center px-0 py-2.5",
        );

        const linkInner = (
          <>
            <Icon className="size-[1.15rem] shrink-0 opacity-90" aria-hidden />
            {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
          </>
        );

        return (
          <li key={item.id}>
            <NavIconButton label={item.label} collapsed={collapsed}>
              <Link href={item.href} className={linkClass} onClick={onNavigate}>
                {linkInner}
              </Link>
            </NavIconButton>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({
  children,
  brand = { name: "MyMedu", subtitle: "پنل مدیریت", logoLetter: "M" },
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      /* */
    }
  }, []);

  const persistCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobileViewport(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    const auto = getOpenNavGroupIds(pathname, ADMIN_NAV);
    setExpanded((prev) => {
      const next = { ...prev };
      auto.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const pageTitle = useMemo(() => getAdminPageTitle(pathname), [pathname]);

  const toggleGroup = useCallback((id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  const expandSidebarAndOpen = useCallback((id: string) => {
    persistCollapsed(false);
    setExpanded((p) => ({ ...p, [id]: true }));
    setMobileOpen(false);
  }, [persistCollapsed]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const onLogout = useCallback(() => {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    } catch {
      /* */
    }
    window.location.assign(MAIN_SITE_URL);
  }, []);

  const effectiveCollapsed = collapsed && !isMobileViewport;

  const sidebarInner = (
    <>
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-border/80 px-3 py-3",
          effectiveCollapsed && "flex-col gap-2 px-2",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          {brand.logoLetter?.slice(0, 1) ?? "M"}
        </span>
        {!effectiveCollapsed ? (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{brand.name}</p>
            {brand.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{brand.subtitle}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3" aria-label="منوی اصلی">
        <SidebarNav
          items={ADMIN_NAV}
          depth={0}
          pathname={pathname}
          collapsed={effectiveCollapsed}
          expanded={expanded}
          toggleGroup={toggleGroup}
          onNavigate={closeMobile}
          expandSidebarAndOpen={expandSidebarAndOpen}
        />
      </nav>

      <div className="border-t border-border/80 p-2">
        <NavIconButton label="تنظیمات" collapsed={effectiveCollapsed}>
          <Link
            href="/settings"
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              effectiveCollapsed && "justify-center px-0",
            )}
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            {!effectiveCollapsed ? <span>تنظیمات</span> : null}
          </Link>
        </NavIconButton>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={280}>
      <div
        className="admin-shell"
        data-sidebar={effectiveCollapsed ? "minimal" : "maximal"}
        data-mobile-nav={mobileOpen ? "open" : "closed"}
      >
        <aside
          className={cn(
            "admin-sidebar",
            effectiveCollapsed && "admin-sidebar--collapsed",
            mobileOpen && "admin-sidebar--open",
          )}
          aria-label="ناوبری پنل"
        >
          {sidebarInner}
        </aside>

        <button
          type="button"
          className={cn("admin-sidebar-backdrop", mobileOpen && "is-visible")}
          aria-label="بستن منو"
          onClick={closeMobile}
        />

        <div className="admin-main">
          <header className="admin-header">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="باز کردن منوی کناری"
              >
                <Menu className="size-[1.1rem]" aria-hidden />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden shrink-0 lg:inline-flex"
                onClick={() => persistCollapsed(!collapsed)}
                aria-label={effectiveCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
              >
                {effectiveCollapsed ? (
                  <PanelLeftClose className="size-[1.1rem]" aria-hidden />
                ) : (
                  <PanelRightClose className="size-[1.1rem]" aria-hidden />
                )}
              </Button>

              <div className="min-w-0">
                <p className="text-[0.7rem] text-muted-foreground">پنل مدیریت</p>
                <h1 className="truncate text-base font-semibold leading-tight">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button type="button" variant="outline" size="icon" aria-label="اعلان‌ها">
                <Bell className="size-[1.05rem]" aria-hidden />
              </Button>
              <UserIdentityHub
                user={{
                  name: "مدیر سیستم",
                  role: "Administrator",
                  email: "admin@mymedu.ir",
                }}
                actions={[
                  {
                    id: "settings",
                    label: "تنظیمات",
                    onClick: () => window.location.assign("/settings"),
                  },
                  {
                    id: "logout",
                    label: "خروج از حساب",
                    variant: "destructive",
                    onClick: onLogout,
                  },
                ]}
              />
            </div>
          </header>

          <main className="admin-content-scroll">{children}</main>

          <footer className="admin-footer">
            <span>{brand.name}</span>
            <span className="tabular-nums">
              © {new Date().getFullYear()} · نسخه ۰.۱.۰
            </span>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}

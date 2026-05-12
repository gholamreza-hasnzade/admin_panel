"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { AdminNavItem } from "@/config/admin-navigation";
import { isNavLinkActive } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

import { NavIconButton } from "./nav-icon-button";

export function SidebarNav({
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
          const childActive = item.children!.some((c) => c.href && isNavLinkActive(pathname, c.href));
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

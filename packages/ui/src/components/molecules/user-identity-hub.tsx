"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";
import { Avatar, AvatarImage } from "../atoms/avatar";

export type UserIdentityHubUser = {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
};

export type UserIdentityHubAction = {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  onClick?: () => void;
};

type UserIdentityHubProps = {
  user: UserIdentityHubUser;
  triggerAriaLabel?: string;
  actions?: UserIdentityHubAction[];
  onAction?: (action: UserIdentityHubAction) => void;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  zIndex?: number;
};

const defaultActions: UserIdentityHubAction[] = [
  { id: "profile", label: "هویت من" },
  { id: "settings", label: "تنظیمات حساب" },
  { id: "logout", label: "خروج از حساب", variant: "destructive" },
];

export function UserIdentityHub({
  user,
  triggerAriaLabel = "باز کردن بخش هویت کاربر",
  actions = defaultActions,
  onAction,
  className,
  triggerClassName,
  menuClassName,
  zIndex = 1100,
}: UserIdentityHubProps) {
  const [open, setOpen] = React.useState(false);
  const hubRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);

  const updateMenuPosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxMenuWidth = 256;
    const width = Math.min(maxMenuWidth, window.innerWidth - 16);
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    const offsetTop = window.innerWidth < 640 ? 6 : 8;
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + offsetTop,
      left,
      width,
      zIndex,
    });
  }, [zIndex]);

  React.useEffect(() => {
    if (!open) return;
    updateMenuPosition();

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const isInsideTrigger = Boolean(hubRef.current?.contains(target));
      const isInsideMenu = Boolean(menuRef.current?.contains(target));
      if (!isInsideTrigger && !isInsideMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleWindowUpdate = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleWindowUpdate);
    window.addEventListener("scroll", handleWindowUpdate, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleWindowUpdate);
      window.removeEventListener("scroll", handleWindowUpdate, true);
    };
  }, [open, updateMenuPosition]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  return (
    <div ref={hubRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "flex touch-manipulation items-center gap-2 rounded-md border border-border bg-card/70 px-1.5 py-1 text-right transition-colors hover:bg-muted/70 sm:gap-3 sm:rounded-lg sm:px-2 sm:py-1.5",
          triggerClassName,
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={triggerAriaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[11px] font-semibold text-foreground sm:text-xs">{user.name}</p>
          <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">{user.role}</p>
        </div>
        <Avatar size="sm" name={user.name}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
        </Avatar>
      </button>

      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className={cn(
                "rounded-lg border border-border bg-card p-1.5 shadow-lg sm:rounded-xl sm:p-2",
                menuClassName,
              )}
            >
              <div className="mb-1.5 rounded-md bg-muted/50 p-1.5 sm:mb-2 sm:rounded-lg sm:p-2">
                <p className="truncate text-[11px] font-semibold sm:text-xs">{user.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-[11px]">{user.email}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={cn(
                      "min-h-9 w-full touch-manipulation rounded-md px-2 py-2 text-right text-[11px] transition-colors sm:min-h-10 sm:py-2.5 sm:text-xs",
                      action.variant === "destructive"
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => {
                      action.onClick?.();
                      onAction?.(action);
                      setOpen(false);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

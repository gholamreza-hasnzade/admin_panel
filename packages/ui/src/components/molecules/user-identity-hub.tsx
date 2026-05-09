"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/avatar";

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
    const width = 256;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 8,
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
          "flex items-center gap-3 rounded-lg border border-border bg-card/70 px-2 py-1.5 text-right transition-colors hover:bg-muted/70",
          triggerClassName,
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={triggerAriaLabel}
      >
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-foreground">{user.name}</p>
          <p className="text-[11px] text-muted-foreground">{user.role}</p>
        </div>
        <Avatar size="sm" name={user.name}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      </button>

      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className={cn("rounded-xl border border-border bg-card p-2 shadow-lg", menuClassName)}
            >
              <div className="mb-2 rounded-lg bg-muted/50 p-2">
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{user.email}</p>
              </div>
              <div className="space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={
                      action.variant === "destructive"
                        ? "w-full rounded-md px-2 py-2 text-right text-xs text-destructive transition-colors hover:bg-destructive/10"
                        : "w-full rounded-md px-2 py-2 text-right text-xs text-foreground transition-colors hover:bg-muted"
                    }
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

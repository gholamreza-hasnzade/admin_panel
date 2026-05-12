"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";

export function NavIconButton({
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

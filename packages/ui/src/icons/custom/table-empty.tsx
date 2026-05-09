import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const TableEmptyIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-8 text-muted-foreground/70", className)}
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M8 14h3M8 17h6" />
      <circle cx="17" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </SvgIcon>
  ),
);
TableEmptyIcon.displayName = "TableEmptyIcon";


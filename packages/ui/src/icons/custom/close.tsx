import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const CloseIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={cn("h-3.5 w-3.5", className)}
      {...props}
    >
      <path d="m6 6 12 12" strokeLinecap="round" />
      <path d="M18 6 6 18" strokeLinecap="round" />
    </SvgIcon>
  ),
);
CloseIcon.displayName = "CloseIcon";

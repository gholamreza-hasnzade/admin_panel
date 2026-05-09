import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const UpDownIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
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
      <path d="m8 9 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  ),
);
UpDownIcon.displayName = "UpDownIcon";

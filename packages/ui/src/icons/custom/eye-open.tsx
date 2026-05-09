import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const EyeOpenIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon ref={ref} viewBox="0 0 24 24" fill="none" className={cn("size-4", className)} {...props}>
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </SvgIcon>
  ),
);
EyeOpenIcon.displayName = "EyeOpenIcon";

import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const EyeClosedIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon ref={ref} viewBox="0 0 24 24" fill="none" className={cn("size-4", className)} {...props}>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6 6.3A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a16.7 16.7 0 0 1-3.4 4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 8.2A16.8 16.8 0 0 0 2 12s3.5 6 10 6c1.2 0 2.3-.2 3.2-.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1 14.1A3 3 0 0 1 9.9 9.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  ),
);
EyeClosedIcon.displayName = "EyeClosedIcon";

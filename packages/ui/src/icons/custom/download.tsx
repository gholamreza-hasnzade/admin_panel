import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const DownloadIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={cn("h-3 w-3", className)}
      {...props}
    >
      <path d="M12 4v11" strokeLinecap="round" />
      <path d="m8.5 11.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18.5v1A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-1" strokeLinecap="round" />
    </SvgIcon>
  ),
);
DownloadIcon.displayName = "DownloadIcon";

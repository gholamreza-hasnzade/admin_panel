import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const FileDocumentIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, ...props }, ref) => (
    <SvgIcon
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M7 3.75h7.1L18.75 8.4V20.25H7z" strokeLinejoin="round" />
      <path d="M14 3.75V8.5h4.75" strokeLinejoin="round" />
    </SvgIcon>
  ),
);
FileDocumentIcon.displayName = "FileDocumentIcon";

import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const TrashIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
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
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
        </SvgIcon>
    ),
);
TrashIcon.displayName = "TrashIcon";

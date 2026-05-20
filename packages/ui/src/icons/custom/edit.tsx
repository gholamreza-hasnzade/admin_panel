import * as React from "react";

import { cn } from "../../lib/utils";
import { SvgIcon, type SvgIconProps } from "../svg-icon";

export const EditIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
        </SvgIcon>
    ),
);
EditIcon.displayName = "EditIcon";

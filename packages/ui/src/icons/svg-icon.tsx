import * as React from "react";

import { cn } from "../lib/utils";

export type SvgIconProps = React.SVGProps<SVGSVGElement> & {
  /** When set, the icon is exposed to assistive tech (decorative icons omit this). */
  title?: string;
};

/**
 * Thin base for inline SVG icons: `currentColor`, optional title, decorative by default.
 */
export const SvgIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, title, children, focusable = false, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      focusable={focusable}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  ),
);
SvgIcon.displayName = "SvgIcon";

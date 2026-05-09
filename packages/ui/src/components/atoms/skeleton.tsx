"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: "sm" | "md" | "lg" | "full";
  shimmer?: boolean;
};

function Skeleton({
  className,
  rounded = "md",
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted",
        shimmer && "animate-pulse",
        rounded === "sm" && "rounded-sm",
        rounded === "md" && "rounded-md",
        rounded === "lg" && "rounded-lg",
        rounded === "full" && "rounded-full",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };

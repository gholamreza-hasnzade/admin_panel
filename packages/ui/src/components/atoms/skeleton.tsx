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
        shimmer && "motion-safe:animate-pulse motion-reduce:animate-none",
        rounded === "sm" && "rounded-sm",
        rounded === "md" && "rounded-sm sm:rounded-md",
        rounded === "lg" && "rounded-md sm:rounded-lg",
        rounded === "full" && "rounded-full",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };

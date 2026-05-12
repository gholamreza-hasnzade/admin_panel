"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Avatar, AvatarImage, type AvatarProps } from "../atoms/avatar";

export type AvatarGroupItem = {
  id?: string | number;
  name?: string;
  src?: string;
  alt?: string;
};

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarProps["size"];
  totalCount?: number;
};

function AvatarGroup({ className, items, max = 5, size = "default", totalCount, ...props }: AvatarGroupProps) {
  const normalizedMax = Math.max(1, max);
  const visibleItems = items.slice(0, normalizedMax);
  const hiddenCount = Math.max(0, (totalCount ?? items.length) - visibleItems.length);

  return (
    <div
      className={cn(
        "relative flex touch-manipulation items-center -space-x-2 sm:-space-x-3 rtl:space-x-reverse",
        className,
      )}
      {...props}
    >
      {visibleItems.map((item, index) => (
        <Avatar
          key={item.id ?? `${item.name ?? "avatar"}-${index}`}
          size={size}
          name={item.name}
          className="relative ring-1 ring-background sm:ring-2"
          style={{ zIndex: index }}
        >
          {item.src ? <AvatarImage src={item.src} alt={item.alt ?? item.name ?? "avatar"} /> : null}
        </Avatar>
      ))}

      {hiddenCount > 0 ? (
        <Avatar
          size={size}
          className="relative bg-muted text-muted-foreground ring-1 ring-background sm:ring-2"
          style={{ zIndex: visibleItems.length }}
        >
          <span className="text-[0.65rem] font-medium sm:text-[0.75em]">+{hiddenCount}</span>
        </Avatar>
      ) : null}
    </div>
  );
}

export { AvatarGroup };

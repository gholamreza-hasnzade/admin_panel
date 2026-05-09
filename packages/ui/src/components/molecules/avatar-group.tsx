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
    <div className={cn("flex items-center -space-x-3 rtl:space-x-reverse", className)} {...props}>
      {visibleItems.map((item, index) => (
        <Avatar
          key={item.id ?? `${item.name ?? "avatar"}-${index}`}
          size={size}
          name={item.name}
          className="ring-2 ring-background"
        >
          {item.src ? <AvatarImage src={item.src} alt={item.alt ?? item.name ?? "avatar"} /> : null}
        </Avatar>
      ))}

      {hiddenCount > 0 ? (
        <Avatar size={size} className="bg-muted text-muted-foreground ring-2 ring-background">
          <span className="text-[0.75em] font-medium">+{hiddenCount}</span>
        </Avatar>
      ) : null}
    </div>
  );
}

export { AvatarGroup };

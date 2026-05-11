"use client";

import type { ReactNode } from "react";
import { DataGrid, type DataGridColumnDef } from "@repo/ui";

import { api } from "@/lib/api";

import { eventSliderConfig } from "../lib/config";
import type { SliderItem } from "../model/types";

function showText(value: string | number | null | undefined): ReactNode {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

const VerticalDotsIcon = () => (
  <span aria-hidden className="text-base leading-none text-muted-foreground">
    ⋮
  </span>
);

const TrashIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const sliderColumns: DataGridColumnDef<SliderItem>[] = [
  {
    accessorKey: "id",
    header: "شناسه",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "imageUrl",
    header: "تصویر",
    cell: ({ row }) => {
      const src = row.original.imageUrl;
      if (!src) return <span className="text-muted-foreground">بدون تصویر</span>;
      return (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block max-w-68 truncate text-primary hover:underline"
          title={src}
        >
          {src}
        </a>
      );
    },
  },
  {
    accessorKey: "pStartDate",
    header: "تاریخ شروع",
    cell: ({ row }) => showText(row.original.pStartDate ?? row.original.startDate),
  },
  {
    accessorKey: "pEndDate",
    header: "تاریخ پایان",
    cell: ({ row }) => showText(row.original.pEndDate ?? row.original.endDate),
  },
  {
    accessorKey: "viewTypeTitle",
    header: "نوع نمایش",
    cell: ({ row }) => showText(row.original.viewTypeTitle),
  },
  {
    accessorKey: "userTypeTitle",
    header: "نوع کاربر",
    cell: ({ row }) => showText(row.original.userTypeTitle),
  },
  {
    accessorKey: "orderIndex",
    header: "ترتیب",
    cell: ({ row }) => showText(row.original.orderIndex),
  },
  {
    accessorKey: "href",
    header: "لینک",
    cell: ({ row }) => {
      const href = row.original.href;
      if (!href) return <span className="text-muted-foreground">-</span>;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          باز کردن لینک
        </a>
      );
    },
  },
];

type EventSliderGridProps = {
  onEditRow: (row: SliderItem) => void;
  onDeleteRow: (row: SliderItem) => void;
};

export function EventSliderGrid({ onEditRow, onDeleteRow }: EventSliderGridProps) {
  const appApiBaseUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? "";

  if (!appApiBaseUrl) {
    return (
      <div className="rounded-md border border-destructive/40 bg-card px-4 py-3 text-sm text-destructive">
        متغیر محیطی <code className="rounded bg-muted px-1">NEXT_PUBLIC_APP_API_BASE_URL</code> تنظیم نشده است.
      </div>
    );
  }

  return (
    <DataGrid<SliderItem>
      apiClient={api}
      url={eventSliderConfig.api.grid}
      columns={sliderColumns}
      className="event-slider-grid w-full"
      tableWrapperClassName="event-slider-grid__table"
      dataPath="results"
      totalPath="rowCount"
      initialPageSize={eventSliderConfig.ui.defaultPageSize}
      pageSizeOptions={[10, 20, 50]}
      maxBodyHeightClassName="h-[68dvh]"
      emptyMessage="هیچ اسلایدری یافت نشد."
      globalSearchPlaceholder="جستجو در اسلایدرها..."
      showGlobalSearch={false}
      rowActions={[
        {
          label: "ویرایش",
          onClick: (row) => onEditRow(row),
          variant: "ghost",
          className: "w-full justify-start hover:bg-accent/60",
        },
        {
          label: "حذف",
          onClick: (row) => onDeleteRow(row),
          variant: "ghost",
          icon: <TrashIcon />,
          className: "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
        },
      ]}
      rowActionsMode="toggle"
      rowActionsToggleLabel={null}
      rowActionsToggleIcon={<VerticalDotsIcon />}
      actionsHeader="عملیات"
    />
  );
}

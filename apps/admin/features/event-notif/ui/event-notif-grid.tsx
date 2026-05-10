"use client";

import type { ReactNode } from "react";
import { DataGrid, type DataGridColumnDef } from "@repo/ui";

import { api } from "@/lib/api";

import { eventNotifConfig } from "../lib/config";
import type { EventNotifItem } from "../model/types";

function showText(value: string | number | null | undefined): ReactNode {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

const notifColumns: DataGridColumnDef<EventNotifItem>[] = [
  {
    accessorKey: "id",
    header: "شناسه",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: "عنوان",
    cell: ({ row }) => showText(row.original.title),
  },
  {
    accessorKey: "shortText",
    header: "متن کوتاه",
    cell: ({ row }) => showText(row.original.shortText),
  },
  {
    accessorKey: "longText",
    header: "متن کامل",
    cell: ({ row }) => showText(row.original.longText),
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
    accessorKey: "creator",
    header: "ایجادکننده",
    cell: ({ row }) => showText(row.original.creator),
  },
  {
    accessorKey: "visible",
    header: "وضعیت نمایش",
    cell: ({ row }) =>
      row.original.visible === null ? "-" : row.original.visible ? "فعال" : "غیرفعال",
  },
  {
    accessorKey: "viewSideTitle",
    header: "محل نمایش",
    cell: ({ row }) => showText(row.original.viewSideTitle),
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
    accessorKey: "deleted",
    header: "حذف شده",
    cell: ({ row }) => (row.original.deleted === null ? "-" : row.original.deleted ? "بله" : "خیر"),
  },
];

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

const EditIcon = () => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

type EventNotifGridProps = {
  onEditRow: (row: EventNotifItem) => void | Promise<void>;
  onDeleteRow: (row: EventNotifItem) => void | Promise<void>;
};

export function EventNotifGrid({ onEditRow, onDeleteRow }: EventNotifGridProps) {
  const appApiBaseUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? "";

  if (!appApiBaseUrl) {
    return (
      <div className="rounded-md border border-destructive/40 bg-card px-4 py-3 text-sm text-destructive">
        متغیر محیطی <code className="rounded bg-muted px-1">NEXT_PUBLIC_APP_API_BASE_URL</code> تنظیم نشده است.
      </div>
    );
  }

  return (
    <DataGrid<EventNotifItem>
      apiClient={api}
      url={eventNotifConfig.api.grid}
      columns={notifColumns}
      className="event-notif-grid w-full"
      tableWrapperClassName="event-notif-grid__table"
      dataPath="results"
      totalPath="rowCount"
      initialPageSize={eventNotifConfig.ui.defaultPageSize}
      pageSizeOptions={[10, 20, 50]}
      maxBodyHeightClassName="h-[68dvh]"
      emptyMessage="هیچ اعلانی یافت نشد."
      globalSearchPlaceholder="جستجو در اعلان ها..."
      showGlobalSearch={false}
      rowActions={[
        {
          label: "ویرایش",
          onClick: (row) => onEditRow(row),
          variant: "ghost",
          icon: <EditIcon />,
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

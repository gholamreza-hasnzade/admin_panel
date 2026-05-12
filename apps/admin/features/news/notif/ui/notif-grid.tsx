"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@repo/ui";

import { api } from "@/lib/api";

import { notifConfig } from "../lib/config";
import type { NotifItem } from "../model/types";

const notifColumns: ColumnDef<NotifItem, unknown>[] = [
  { accessorKey: "id", header: "شناسه" },
  { accessorKey: "title", header: "عنوان" },
  { accessorKey: "shortText", header: "متن کوتاه" },
  { accessorKey: "longText", header: "متن کامل" },
  {
    id: "pStartDate",
    accessorFn: (row) => row.pStartDate ?? row.startDate ?? "",
    header: "تاریخ شروع",
  },
  {
    id: "pEndDate",
    accessorFn: (row) => row.pEndDate ?? row.endDate ?? "",
    header: "تاریخ پایان",
  },
  { accessorKey: "creator", header: "ایجادکننده" },
  {
    accessorKey: "visible",
    header: "وضعیت نمایش",
    cell: ({ row }) =>
      row.original.visible === null ? "-" : row.original.visible ? "فعال" : "غیرفعال",
  },
  { accessorKey: "viewSideTitle", header: "محل نمایش" },
  { accessorKey: "userTypeTitle", header: "نوع کاربر" },
  { accessorKey: "orderIndex", header: "ترتیب" },
  {
    accessorKey: "deleted",
    header: "حذف شده",
    cell: ({ row }) => (row.original.deleted === null ? "-" : row.original.deleted ? "بله" : "خیر"),
  },
];

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

type NotifGridProps = {
  onEditRow: (row: NotifItem) => void | Promise<void>;
  onDeleteRow: (row: NotifItem) => void | Promise<void>;
};

export function NotifGrid({ onEditRow, onDeleteRow }: NotifGridProps) {
  const appApiBaseUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? "";

  if (!appApiBaseUrl) {
    return (
      <div className="rounded-md border border-destructive/40 bg-card px-4 py-3 text-sm text-destructive">
        متغیر محیطی <code className="rounded bg-muted px-1">NEXT_PUBLIC_APP_API_BASE_URL</code> تنظیم نشده است.
      </div>
    );
  }

  return (
    <DataTable<NotifItem, unknown>
      className="notif-grid w-full"
      tableClassName="notif-grid__table min-w-[920px]"
      columns={notifColumns}
      urlDatas={notifConfig.api.grid}
      apiClient={api}
      urlDataPath="results"
      urlTotalPath="rowCount"
      pageSize={notifConfig.ui.defaultPageSize}
      pageSizeOptions={[1, 2, 5]}
      enableRowSelection={false}
      enableFiltering={false}
      showGlobalFilter={false}
      showExportButtons={false}
      showColumnOrdering={false}
      showSettingsButton={false}
      showRefreshButton={false}
      actionsLabel="عملیات"
      showActions
      actions={[
        {
          label: "ویرایش",
          icon: <EditIcon />,
          variant: "outline",
          onClick: (row) => {
            void onEditRow(row.original);
          },
        },
        {
          label: "حذف",
          icon: <TrashIcon />,
          variant: "destructive",
          onClick: (row) => {
            void onDeleteRow(row.original);
          },
        },
      ]}
      emptyMessage="هیچ اعلانی یافت نشد."
      loadingMessage="در حال بارگذاری..."
      errorMessage="خطا در دریافت لیست اعلان‌ها"
      getRowId={(row) => String(row.id)}
    />
  );
}

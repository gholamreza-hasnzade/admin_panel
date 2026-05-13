"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@repo/ui";

import { api } from "@/lib/api";

import { eventsConfig } from "../lib/config";
import type { EventItem } from "../model/types";

const columns: ColumnDef<EventItem, unknown>[] = [
  { accessorKey: "id", header: "شناسه" },
  { accessorKey: "title", header: "عنوان" },
  { id: "pStartDate", accessorFn: (row) => row.pStartDate ?? row.startDate ?? "", header: "تاریخ شروع" },
  { id: "pEndDate", accessorFn: (row) => row.pEndDate ?? row.endDate ?? "", header: "تاریخ پایان" },
  { accessorKey: "status", header: "وضعیت" },
  { accessorKey: "visible", header: "نمایش", cell: ({ row }) => row.original.visible == null ? "-" : row.original.visible ? "فعال" : "غیرفعال" },
  { accessorKey: "orderIndex", header: "ترتیب" },
  { accessorKey: "presenter", header: "ارائه‌دهنده" },
];

const TrashIcon = () => <span aria-hidden>🗑️</span>;
const EditIcon = () => <span aria-hidden>✏️</span>;

export function EventsGrid({ onEditRow, onDeleteRow }: { onEditRow: (row: EventItem) => void | Promise<void>; onDeleteRow: (row: EventItem) => void | Promise<void>; }) {
  return (
    <DataTable<EventItem, unknown>
      className="events-grid w-full"
      tableClassName="events-grid__table min-w-[920px]"
      columns={columns}
      urlDatas={eventsConfig.api.grid}
      apiClient={api}
      pageSize={eventsConfig.ui.defaultPageSize}
      pageSizeOptions={[...eventsConfig.ui.pageSizeOptions]}
      enableRowSelection={false}
      enableFiltering={false}
      showGlobalFilter={false}
      showExportButtons={false}
      showColumnOrdering={false}
      showSettingsButton={false}
      showRefreshButton
      actionsLabel="عملیات"
      showActions
      actions={[
        { label: "ویرایش", icon: <EditIcon />, variant: "outline", onClick: (row) => void onEditRow(row.original) },
        { label: "حذف", icon: <TrashIcon />, variant: "destructive", onClick: (row) => void onDeleteRow(row.original) },
      ]}
      emptyMessage="هیچ رویدادی یافت نشد."
      loadingMessage="در حال بارگذاری..."
      errorMessage="خطا در دریافت لیست رویدادها"
      getRowId={(row) => String(row.id)}
    />
  );
}

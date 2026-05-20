"use client";

import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { DataTable, EditIcon, TrashIcon } from "@repo/ui";

import { api } from "@/lib/api";

import { sliderConfig } from "../lib/config";
import type { SliderItem } from "../model/types";

function showText(value: string | number | null | undefined): ReactNode {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

const sliderColumns: ColumnDef<SliderItem, unknown>[] = [
  {
    accessorKey: "imageUrl",
    header: "لینک تصویر",
    cell: ({ row }) => {
      const src = row.original.imageUrl;
      if (!src) return <span className="text-muted-foreground">بدون تصویر</span>;
      return (
        <a
          href={row.original.href || ""}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-block max-w-68 truncate hover:underline"
          title={src}
        >
          <Image src={src} alt="slider" width={100} height={100} className="w-full h-auto" unoptimized />
        </a>
      );
    },
  },
  {
    id: "pStartDate",
    accessorFn: (row) => row.pStartDate ?? row.startDate ?? "",
    header: "تاریخ شروع",
    cell: ({ row }) => showText(row.original.pStartDate ?? row.original.startDate),
  },
  {
    id: "pEndDate",
    accessorFn: (row) => row.pEndDate ?? row.endDate ?? "",
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
  { accessorKey: "orderIndex", header: "ترتیب" },
];

type SliderGridProps = {
  onEditRow: (row: SliderItem) => void | Promise<void>;
  onDeleteRow: (row: SliderItem) => void | Promise<void>;
};

export function SliderGrid({ onEditRow, onDeleteRow }: SliderGridProps) {
  const appApiBaseUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? "";

  if (!appApiBaseUrl) {
    return (
      <div className="border-destructive/40 bg-card text-destructive rounded-md border px-4 py-3 text-sm">
        متغیر محیطی <code className="bg-muted rounded px-1">NEXT_PUBLIC_APP_API_BASE_URL</code> تنظیم نشده است.
      </div>
    );
  }

  return (
    <DataTable<SliderItem, unknown>
      className="slider-grid w-full"
      tableClassName="slider-grid__table min-w-[920px]"
      columns={sliderColumns}
      urlDatas={sliderConfig.api.grid}
      apiClient={api}
      urlDataPath="results"
      urlTotalPath="rowCount"
      pageSize={sliderConfig.ui.defaultPageSize}
      pageSizeOptions={[10, 20, 50]}
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
      emptyMessage="هیچ اسلایدری یافت نشد."
      loadingMessage="در حال بارگذاری..."
      errorMessage="خطا در دریافت لیست اسلایدرها"
      getRowId={(row) => String(row.id)}
    />
  );
}

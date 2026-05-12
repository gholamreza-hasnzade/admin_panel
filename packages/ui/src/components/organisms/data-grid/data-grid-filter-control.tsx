"use client";
import * as React from "react";
import type { Header } from "@tanstack/react-table";
import { TextField } from "../../atoms/text-field";
import { GRID_CLASS } from "./data-grid.constants";
import type { DataGridColumnMeta } from "./data-grid.types";
type DataGridFilterControlProps<TData> = {
  header: Header<TData, unknown>;
  textValue: string;
  onTextValueChange: (columnId: string, value: string) => void;
};
function DataGridFilterControlComponent<TData>({
  header,
  textValue,
  onTextValueChange,
}: DataGridFilterControlProps<TData>) {
  const meta = (header.column.columnDef.meta ?? {}) as DataGridColumnMeta;
  const filterType = meta.filterType;
  const column = header.column;
  const value = (column.getFilterValue() ?? "") as string;
  if (!filterType || header.isPlaceholder) return null;
  if (filterType === "select") {
    return (
      <select
        value={value}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className={GRID_CLASS.filterControl}
        aria-label={`Filter ${column.id}`}
      >
        <option value="">همه</option>
        {meta.filterOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  if (filterType === "checkbox") {
    return (
      <select
        value={value}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className={GRID_CLASS.filterControl}
        aria-label={`Filter ${column.id}`}
      >
        <option value="">همه</option>
        <option value="true">فعال</option>
        <option value="false">غیرفعال</option>
      </select>
    );
  }
  if (filterType === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className={GRID_CLASS.filterControl}
        aria-label={`Filter ${column.id}`}
      />
    );
  }
  return (
    <TextField
      value={textValue}
      onChange={(event) => onTextValueChange(column.id, event.target.value)}
      placeholder="جستجو..."
      size="sm"
      className="w-full"
      containerClassName="h-8"
      inputClassName="text-xs"
    />
  );
}
export const DataGridFilterControl = React.memo(
  DataGridFilterControlComponent,
) as typeof DataGridFilterControlComponent;

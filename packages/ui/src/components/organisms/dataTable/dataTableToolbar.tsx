"use client";

import { Button } from "../../atoms/button";
import { 
  RefreshCwIcon,
  DownloadIcon,
  UploadIcon,
  SettingsIcon,
} from 'lucide-react';
import { cn } from "../../../lib/utils";
import type { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  showSelectedCount?: boolean;
  showExportButtons?: boolean;
  showRefreshButton?: boolean;
  showSettingsButton?: boolean;
  loading?: boolean;
  onSettingsToggle?: () => void;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
 
  showSelectedCount = true,
  showExportButtons = true,
  showRefreshButton = true,
  showSettingsButton = true,
  loading = false,
  onSettingsToggle,
  className,
}: DataTableToolbarProps<TData>) {
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const hasVisibleChrome =
    (showSelectedCount && selectedCount > 0) ||
    showExportButtons ||
    showRefreshButton ||
    showSettingsButton;
  if (!hasVisibleChrome) {
    return null;
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border gap-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {/* {showRowCount && (
            <div className="text-muted-foreground text-sm">
              {filteredRowCount} of {totalRowCount} rows
            </div>
          )} */}

          {showSelectedCount && selectedCount > 0 && (
            <div className="text-sm text-primary font-medium">
              {selectedCount} selected
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {showExportButtons && (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<DownloadIcon className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<UploadIcon className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Import</span>
            </Button>
          </>
        )}

        {showRefreshButton && (
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCwIcon className="w-4 h-4" />}
            loading={loading}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}



        {showSettingsButton && (
          <Button
            variant="outline"
            size="sm"
            icon={<SettingsIcon className="w-4 h-4" />}
            onClick={onSettingsToggle}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}
      </div>
    </div>
  );
}

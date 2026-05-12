"use client";

import  { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, FileIcon } from 'lucide-react';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface DataTableExportProps<TData> {
  table: Table<TData>;
  data: TData[];
  filename?: string;
  selectedRows?: TData[];
  exportOnlySelected?: boolean;
}

export function DataTableExport<TData>({
  table,
  data,
  filename = 'data',
  selectedRows = [],
  exportOnlySelected = false,
}: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = selectedRows.length > 0 && exportOnlySelected ? selectedRows : data;

  const convertToCSV = (data: TData[]) => {
    const headers = table.getAllColumns()
      .filter(column => column.getIsVisible())
      .map(column => column.columnDef.header as string);

    const rows = data.map(row => {
      return table.getAllColumns()
        .filter(column => column.getIsVisible())
        .map(column => {
          const record = row as Record<string, unknown>;
          const value = column.accessorFn ? column.accessorFn(row, 0) : record[column.id];
          // Escape CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        });
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const convertToJSON = (data: TData[]) => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, format: ExportFormat) => {
    const mimeTypes = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      json: 'application/json',
    };

    const extensions = {
      csv: 'csv',
      excel: 'xlsx',
      pdf: 'pdf',
      json: 'json',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extensions[format]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      switch (format) {
        case 'csv': {
          const csvContent = convertToCSV(exportData);
          downloadFile(csvContent, 'csv');
          break;
        }
        case 'json': {
          const jsonContent = convertToJSON(exportData);
          downloadFile(jsonContent, 'json');
          break;
        }
        case 'excel': {
          const excelContent = convertToCSV(exportData);
          downloadFile(excelContent, 'excel');
          break;
        }
        case 'pdf': {
          const pdfContent = convertToCSV(exportData);
          downloadFile(pdfContent, 'pdf');
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      format: 'csv' as ExportFormat,
      label: 'CSV',
      icon: <FileTextIcon className="w-4 h-4" />,
      description: 'Comma-separated values',
    },
    {
      format: 'excel' as ExportFormat,
      label: 'Excel',
      icon: <FileSpreadsheetIcon className="w-4 h-4" />,
      description: 'Microsoft Excel format',
    },
    {
      format: 'json' as ExportFormat,
      label: 'JSON',
      icon: <FileIcon className="w-4 h-4" />,
      description: 'JavaScript Object Notation',
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF',
      icon: <FileTextIcon className="w-4 h-4" />,
      description: 'Portable Document Format',
    },
  ];

  return (
    <div className="relative group">
      <button
        disabled={isExporting}
        className="border-input text-foreground hover:bg-accent focus:border-ring focus:ring-ring flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="w-4 h-4" />
        <span>Export</span>
        {isExporting && (
          <div className="border-primary border-t-transparent h-4 w-4 animate-spin rounded-full border-2" />
        )}
      </button>

      {/* Export Dropdown */}
      <div className="border-border bg-popover text-popover-foreground invisible absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="py-1">
          {exportOptions.map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className="text-foreground hover:bg-accent flex w-full cursor-pointer items-center space-x-3 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {option.icon}
              <div className="flex-1 text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-muted-foreground text-xs">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
        
        {selectedRows.length > 0 && (
          <div className="border-border border-t px-4 py-2">
            <div className="text-muted-foreground text-xs">
              Exporting {exportOnlySelected ? selectedRows.length : data.length} of {data.length} rows
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { GroupIcon } from 'lucide-react';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';

export interface GroupingConfig {
  enabled: boolean;
  groupBy: string[];
  onGroupByChange: (groupBy: string[]) => void;
  aggregations?: Record<string, AggregationType[]>;
  showGroupingPanel?: boolean;
  showAggregations?: boolean;
}

export interface DataTableGroupingProps<TData> {
  table: Table<TData>;
  config: GroupingConfig;
  data: TData[];
}

const calculateAggregation = (values: unknown[], type: AggregationType): number | string => {
  const numericValues = values.filter((v): v is number => typeof v === "number" && !isNaN(v));
  
  switch (type) {
    case 'sum':
      return numericValues.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return numericValues.length > 0 ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0;
    case 'count':
      return values.length;
    case 'min':
      return numericValues.length > 0 ? Math.min(...numericValues) : 0;
    case 'max':
      return numericValues.length > 0 ? Math.max(...numericValues) : 0;
    case 'distinct':
      return new Set(values).size;
    default:
      return 0;
  }
};

export function DataTableGrouping<TData>({
  table,
  config,
}: DataTableGroupingProps<TData>) {
  const [showGroupingPanel, setShowGroupingPanel] = useState(config.showGroupingPanel ?? true);

  const availableColumns = table.getAllColumns().filter(column => 
    column.getCanGroup() && column.id !== 'select' && column.id !== 'actions'
  );

  const handleGroupToggle = (columnId: string) => {
    const newGroupBy = config.groupBy.includes(columnId)
      ? config.groupBy.filter(id => id !== columnId)
      : [...config.groupBy, columnId];
    
    config.onGroupByChange(newGroupBy);
  };


  if (!config.enabled) return null;

  return (
    <div className="space-y-4">
      {/* Grouping Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowGroupingPanel(!showGroupingPanel)}
          className="border-input text-foreground hover:bg-accent focus:border-ring focus:ring-ring flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm focus:ring-2"
        >
          <GroupIcon className="w-4 h-4" />
          <span>Grouping</span>
          {config.groupBy.length > 0 && (
            <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs">
              {config.groupBy.length}
            </span>
          )}
        </button>
        
        {config.groupBy.length > 0 && (
          <button
            onClick={() => config.onGroupByChange([])}
            className="text-destructive hover:bg-destructive/10 rounded-lg px-3 py-2 text-sm"
          >
            Clear Grouping
          </button>
        )}
      </div>

      {/* Grouping Panel */}
      {showGroupingPanel && (
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <h4 className="text-foreground mb-3 text-sm font-medium">Group by columns</h4>
          
          <div className="space-y-2">
            {availableColumns.map((column) => (
              <label
                key={column.id}
                className="hover:bg-accent flex cursor-pointer items-center space-x-2 rounded p-2"
              >
                <input
                  type="checkbox"
                  checked={config.groupBy.includes(column.id)}
                  onChange={() => handleGroupToggle(column.id)}
                  className="border-input text-primary focus:ring-ring rounded"
                />
                <span className="text-foreground text-sm">
                  {column.columnDef.header as string}
                </span>
              </label>
            ))}
          </div>
          
          {config.groupBy.length === 0 && (
            <p className="text-muted-foreground mt-2 text-sm">
              Select columns to group by. Drag columns to reorder grouping.
            </p>
          )}
        </div>
      )}

      {/* Grouping Instructions */}
      {config.groupBy.length > 0 && (
        <div className="bg-primary/10 text-muted-foreground rounded-lg p-3 text-sm">
          <p>
            <strong>Grouped by:</strong> {config.groupBy.map(id => {
              const column = table.getColumn(id);
              return column?.columnDef.header as string;
            }).join(' → ')}
          </p>
          <p className="mt-1">
            Click the chevron icons to expand/collapse groups. 
            {config.showAggregations && ' Aggregations are shown for each group.'}
          </p>
        </div>
      )}
    </div>
  );
}

export { calculateAggregation };

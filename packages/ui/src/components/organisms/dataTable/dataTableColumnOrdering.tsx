"use client";

import { useState } from 'react';
import { GripVerticalIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from "../../../lib/utils";
import type { Table } from '@tanstack/react-table';

interface DataTableColumnOrderingProps<TData> {
  table: Table<TData>;
  onClose?: () => void;
}

export function DataTableColumnOrdering<TData>({
  table,
  onClose,
}: DataTableColumnOrderingProps<TData>) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const columns = table.getAllColumns();
  const columnOrder = table.getState().columnOrder;

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedItem(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    if (!draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(columnId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    if (!draggedItem) return;
    e.preventDefault();
    
    if (draggedItem !== targetColumnId) {
      const draggedIndex = columnOrder.findIndex(id => id === draggedItem);
      const targetIndex = columnOrder.findIndex(id => id === targetColumnId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...columnOrder];
        const draggedCol = newOrder[draggedIndex];
        if (draggedCol !== undefined) {
          newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, draggedCol);
          table.setColumnOrder(newOrder);
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    const currentIndex = columnOrder.findIndex(id => id === columnId);
    if (currentIndex === -1) return;
    
    const newOrder = [...columnOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const a = newOrder[currentIndex];
      const b = newOrder[targetIndex];
      if (a === undefined || b === undefined) return;
      newOrder[currentIndex] = b;
      newOrder[targetIndex] = a;
      table.setColumnOrder(newOrder);
    }
  };

  const resetOrder = () => {
    const defaultOrder = columns.map(col => col.id);
    table.setColumnOrder(defaultOrder);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-semibold">Column Ordering</h3>
        <div className="flex gap-2">
          <button
            onClick={resetOrder}
            className="text-primary hover:bg-primary/10 rounded px-3 py-1 text-sm transition-colors hover:text-primary"
          >
            Reset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded px-3 py-1 text-sm transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-muted-foreground mb-3 text-sm">
          Drag and drop columns to reorder them, or use the arrow buttons.
        </p>
        
        {columnOrder.map((columnId, index) => {
          const column = columns.find(col => col.id === columnId);
          if (!column) return null;
          
          const isPinned = column.getIsPinned();
          const isVisible = column.getIsVisible();
          
          return (
            <div
              key={columnId}
              className={cn(
                'border-border bg-card flex items-center gap-3 rounded-lg border p-3 transition-all duration-200',
                {
                  'opacity-50': draggedItem === columnId,
                  'border-primary/30 bg-primary/10': dragOverItem === columnId,
                  'bg-muted/80': !isVisible,
                }
              )}
              draggable={!isPinned}
              onDragStart={(e) => handleDragStart(e, columnId)}
              onDragOver={(e) => handleDragOver(e, columnId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              {/* Drag handle */}
              {!isPinned && (
                <div className="text-muted-foreground cursor-grab hover:text-foreground active:cursor-grabbing">
                  <GripVerticalIcon className="w-4 h-4" />
                </div>
              )}
              
              {/* Column info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate font-medium">
                    {typeof column.columnDef.header === 'string' 
                      ? column.columnDef.header 
                      : column.id}
                  </span>
                  {isPinned && (
                    <span className="bg-primary/15 text-primary rounded px-2 py-1 text-xs">
                      Pinned
                    </span>
                  )}
                  {!isVisible && (
                    <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  ID: {column.id}
                </div>
              </div>
              
              {/* Move buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => moveColumn(columnId, 'up')}
                  disabled={index === 0 || Boolean(isPinned)}
                  className={cn(
                    'hover:bg-accent rounded p-1 transition-colors',
                    {
                      'opacity-50 cursor-not-allowed': index === 0 || Boolean(isPinned),
                      'hover:bg-muted': index > 0 && !isPinned,
                    }
                  )}
                  title="Move up"
                >
                  <ArrowUpIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveColumn(columnId, 'down')}
                  disabled={index === columnOrder.length - 1 || Boolean(isPinned)}
                  className={cn(
                    'hover:bg-accent rounded p-1 transition-colors',
                    {
                      'opacity-50 cursor-not-allowed':
                        index === columnOrder.length - 1 || Boolean(isPinned),
                      'hover:bg-muted': index < columnOrder.length - 1 && !isPinned,
                    }
                  )}
                  title="Move down"
                >
                  <ArrowDownIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-muted/60 mt-4 rounded-lg p-3">
        <p className="text-muted-foreground text-xs">
          <strong>Tip:</strong> Pinned columns cannot be reordered. Hidden columns are shown in gray.
        </p>
      </div>
    </div>
  );
}
